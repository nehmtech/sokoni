from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User, Vendor, Category, Product,
    Cart, CartItem, Order, OrderItem, Payment, Review,
)


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Extra info", {"fields": ("role", "phone", "profile_image")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra info", {"fields": ("role", "phone", "profile_image")}),
    )
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role",)


class VendorAdmin(admin.ModelAdmin):
    list_display = ("shop_name", "user", "is_approved")
    list_filter = ("is_approved",)
    search_fields = ("shop_name",)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "vendor", "category", "price", "stock", "is_active")
    list_filter = ("category", "vendor", "is_active")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


class CartAdmin(admin.ModelAdmin):
    list_display = ("user",)
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "status", "total_amount")
    list_filter = ("status",)
    inlines = [OrderItemInline]


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "vendor", "quantity", "price")
    list_filter = ("vendor",)


class PaymentAdmin(admin.ModelAdmin):
    list_display = ("order", "method", "amount", "status")
    list_filter = ("method", "status")


class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating")
    list_filter = ("rating",)


admin.site.register(User, CustomUserAdmin)
admin.site.register(Vendor, VendorAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem, OrderItemAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(Review, ReviewAdmin)