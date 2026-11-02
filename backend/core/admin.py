from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Product, User, Vendor

admin.site.register(Product)

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Extra info", {"fields": ("role", "phone")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra info", {"fields": ("role", "phone")}),
    )
    list_display = ("username", "email", "role", "is_staff")
    list_filter = ("role", "is_staff")

admin.site.register(User, CustomUserAdmin)

# ========== Vendor ===============#
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("shop_name", "user", "is_approved")
    
