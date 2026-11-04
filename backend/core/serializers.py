from rest_framework import serializers

from .models import (
    User, Vendor, Category, Product,
    Cart, CartItem, Order, OrderItem, Payment, Review,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "phone", "profile_image"]
        read_only_fields = ["id", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "phone"]

    def create(self, validated_data):
        # create_user hashes the password properly
        return User.objects.create_user(**validated_data)


class VendorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Vendor
        fields = ["id", "username", "shop_name", "description", "logo", "is_approved"]
        read_only_fields = ["is_approved"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.shop_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "vendor", "vendor_name", "category", "category_name",
                  "title", "image", "slug", "description", "price", "stock", "is_active"]
        read_only_fields = ["vendor"]  # set from the logged-in vendor in the view

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
    )

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source="cartitem_set", many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "items"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    vendor_name = serializers.CharField(source="vendor.shop_name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_title", "vendor", "vendor_name",
                  "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source="orderitem_set", many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "customer", "customer_name", "address",
                  "status", "total_amount", "items"]
        read_only_fields = ["customer", "status", "total_amount"]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "order", "method", "amount", "status", "transaction_id"]
        read_only_fields = ["status", "transaction_id"]


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["id", "product", "user", "username", "rating", "comment"]
        read_only_fields = ["user"]  # set from request.user in the view