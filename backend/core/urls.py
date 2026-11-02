from django.urls import path
from .views import ProductListListView
urlpatterns = [
   path("products/", ProductListListView.as_view(), name="product_list"),
]
