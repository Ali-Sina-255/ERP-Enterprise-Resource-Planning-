from django.shortcuts import render
from rest_framework import generics, permissions

from .models import Category, SubCategory
from .serializers import CategorySerializer, SubCategorySerializer


# Create your views here.
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
