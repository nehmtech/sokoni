from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "title", "image", "slug", "description", "price", "stock", "is_active", "created_at", "update_at"]