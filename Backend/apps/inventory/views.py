from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions

from .models import Inventory, ProductCategory
from .serializer import CategorySerializer, InventorySerializer


class InventoryViewSet(generics.ListCreateAPIView):
    queryset = Inventory.objects.select_related("category", "vendor").all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.AllowAny]


class InventoryDetailViewSet(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.select_related("category", "vendor").all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.AllowAny]


class ProductCategoryViewSet(generics.ListCreateAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductCategoryDetailViewSet(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
