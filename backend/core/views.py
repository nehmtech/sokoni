from django.db import transaction
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import (
    User, Vendor, Category, Product,
    Cart, CartItem, Order, OrderItem, Payment, Review,
)

from .serializers import (
    UserSerializer, RegisterSerializer, VendorSerializer, CategorySerializer,
    ProductSerializer, CartSerializer, CartItemSerializer, OrderSerializer,
    OrderItemSerializer, PaymentSerializer, ReviewSerializer,
)


# ---------- HELPERS ----------
def get_vendor(user):
    """Return the user's approved shop, or stop with an error."""
    try:
        vendor = user.vendor
    except Vendor.DoesNotExist:
        raise PermissionDenied("You are not a vendor.")
    if not vendor.is_approved:
        raise PermissionDenied("Your shop is not approved yet.")
    return vendor


def orders_with_items():
    """Orders with their customer and items loaded in a few queries, not one per row."""
    return Order.objects.select_related("customer").prefetch_related(
        "orderitem_set__product", "orderitem_set__vendor"
    )


# ---------- USERS ----------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------- CATEGORIES ----------
class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None  # small list, send all of it


# ---------- VENDORS ----------
class VendorList(generics.ListCreateAPIView):
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
  

    def get_queryset(self):
        return Vendor.objects.filter(is_approved=True).select_related("user")

    def perform_create(self, serializer):
        if Vendor.objects.filter(user=self.request.user).exists():
            raise ValidationError("You already have a shop.")
        serializer.save(user=self.request.user)  # stays unapproved until an admin approves


# ---------- PRODUCTS ----------
class ProductList(generics.ListCreateAPIView):
    """GET /products/?search=laptop&category=electronics   |   POST to add a product (vendors)"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        # select_related loads vendor and category in the SAME query
        queryset = (
            Product.objects.select_related("vendor", "category")
            .filter(is_active=True, vendor__is_approved=True)
            .order_by("-id")
        )
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset

    def perform_create(self, serializer):
        serializer.save(vendor=get_vendor(self.request.user))


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Product.objects.select_related("vendor", "category")
        if self.request.method == "GET":
            queryset = queryset.filter(is_active=True, vendor__is_approved=True)
        return queryset

    def perform_update(self, serializer):
        if serializer.instance.vendor.user_id != self.request.user.id:
            raise PermissionDenied("This is not your product.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.vendor.user_id != self.request.user.id:
            raise PermissionDenied("This is not your product.")
        instance.delete()


# ---------- CART ----------
class CartView(generics.RetrieveAPIView):
    """GET /cart/ shows the logged-in user's cart."""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        # one extra query loads every item together with its product, vendor and category
        return Cart.objects.prefetch_related(
            "cartitem_set__product__vendor", "cartitem_set__product__category"
        ).get(pk=cart.pk)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """POST {"product_id": 1, "quantity": 2}"""
    serializer = CartItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.validated_data["product"]
    quantity = serializer.validated_data.get("quantity", 1)

    if quantity < 1:
        raise ValidationError({"quantity": "Must be at least 1."})

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item = CartItem.objects.filter(cart=cart, product=product).first()

    # if the product is already in the cart, add to it (no duplicate rows)
    new_quantity = quantity + (item.quantity if item else 0)
    if new_quantity > product.stock:
        raise ValidationError({"quantity": f"Only {product.stock} in stock."})

    if item:
        item.quantity = new_quantity
        item.save(update_fields=["quantity"])
    else:
        item = CartItem.objects.create(cart=cart, product=product, quantity=new_quantity)

    return Response(CartItemSerializer(item, context={"request": request}).data, status=201)


class CartItemDelete(generics.DestroyAPIView):
    """DELETE /cart/items/<id>/ removes one item from the cart."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)  # only your own items


# ---------- ORDERS ----------
class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return orders_with_items().filter(customer=self.request.user).order_by("-id")


class OrderDetail(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return orders_with_items().filter(customer=self.request.user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    """POST {"address": "..."} turns the cart into an order."""
    address = str(request.data.get("address", "")).strip()
    if not address:
        raise ValidationError({"address": "Address is required."})

    cart_items = list(CartItem.objects.filter(cart__user=request.user))
    if not cart_items:
        raise ValidationError("Your cart is empty.")

    # atomic = if anything fails below, NOTHING is saved (no half-made orders)
    with transaction.atomic():
        # lock the products and load them all in one query
        products = Product.objects.select_for_update().in_bulk(
            [item.product_id for item in cart_items]
        )

        order = Order.objects.create(customer=request.user, address=address)
        order_items = []
        total = 0

        for item in cart_items:
            product = products[item.product_id]
            if not product.is_active or product.stock < item.quantity:
                raise ValidationError(f"'{product.title}' is out of stock.")

            product.stock -= item.quantity
            total += product.price * item.quantity
            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    vendor_id=product.vendor_id,  # copy the vendor onto the order item
                    quantity=item.quantity,
                    price=product.price,          # price at the time of purchase
                )
            )

        OrderItem.objects.bulk_create(order_items)                 # saves all items in one query
        Product.objects.bulk_update(products.values(), ["stock"])  # updates all stock in one query
        order.total_amount = total
        order.save()
        CartItem.objects.filter(cart__user=request.user).delete()  # empty the cart

    order = orders_with_items().get(pk=order.pk)
    return Response(OrderSerializer(order, context={"request": request}).data, status=201)


class VendorSales(generics.ListAPIView):
    """GET /orders/vendor-sales/ shows what the logged-in vendor has sold."""
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor = get_vendor(self.request.user)
        return (
            OrderItem.objects.filter(vendor=vendor)
            .select_related("product", "vendor")
            .order_by("-id")
        )


# ---------- PAYMENTS ----------
class PaymentList(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(order__customer=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        order = serializer.validated_data["order"]
        if order.customer_id != self.request.user.id:
            raise ValidationError("This is not your order.")
        serializer.save(amount=order.total_amount)  # use the real total, not the client's number


# ---------- REVIEWS ----------
class ReviewList(generics.ListCreateAPIView):
    """GET /reviews/?product=1   |   POST to add a review"""
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.select_related("user").order_by("-id")
        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        product = serializer.validated_data["product"]
        if Review.objects.filter(product=product, user=self.request.user).exists():
            raise ValidationError("You already reviewed this product.")
        serializer.save(user=self.request.user)