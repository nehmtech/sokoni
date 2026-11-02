from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

# ============ User ===========#
class User(AbstractUser):
    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("vendor", "Vendor"),
        ("admin", "Admin"),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="customer")
    profile_image = models.ImageField(upload_to="profile/images/", blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return self.username
    
# ========== Vendor ==============#

class Vendor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    shop_name = models.CharField(max_length=100)
    shop_description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="vendor/logos/", blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    
    def __str__(self):
        return self.shop_name


class Product(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="products", blank=True, unique=False)
    slug = models.SlugField(unique=True, blank=False)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return f"{self.title}"


