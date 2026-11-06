from django.urls import path

from .views import (
    RegisterView, MeView, CategoryList, VendorList, ProductList, ProductDetail,
    CartView, add_to_cart, CartItemDelete, OrderList, OrderDetail, checkout,
    VendorSales, PaymentList, ReviewList,
)

urlpatterns = [
    # users
    path("auth/register/", RegisterView.as_view()),
    path("auth/me/", MeView.as_view()),

    # shop
    path("categories/", CategoryList.as_view()),
    path("vendors/", VendorList.as_view()),
    path("products/", ProductList.as_view()),
    path("products/<slug:slug>/", ProductDetail.as_view()),

    # cart
    path("cart/", CartView.as_view()),
    path("cart/add/", add_to_cart),
    path("cart/items/<int:pk>/", CartItemDelete.as_view()),

    # orders
    path("orders/", OrderList.as_view()),
    path("orders/checkout/", checkout),
    path("orders/vendor-sales/", VendorSales.as_view()),
    path("orders/<int:pk>/", OrderDetail.as_view()),

    # payments and reviews
    path("payments/", PaymentList.as_view()),
    path("reviews/", ReviewList.as_view()),
]