from django.shortcuts import render
from rest_framework import generics, permissions

from .models import Category, SubCategory, Vendor
from .serializers import CategorySerializer, SubCategorySerializer, VendorSerializer


# Create your views here.status
class CategoryCrateApiView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
    lookup_url_kwarg = "id"


class SubCategoryApiViewSet(generics.ListCreateAPIView):
    queryset = SubCategory.objects.select_related("category")
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]


class SubCategoryRetrieveDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubCategory.objects.select_related("category")
    serializer_class = SubCategorySerializer
    permission_classes = [permissions.AllowAny]


class VendorListCreateView(generics.ListCreateAPIView):
    queryset = Vendor.objects.select_related("category", "subcategory").all()
    permission_classes = [permissions.AllowAny]
    serializer_class = VendorSerializer


class VendorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.select_related("category", "subcategory").all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
