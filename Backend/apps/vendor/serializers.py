from rest_framework import serializers

from .models import Category, SubCategory, Vendor


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at", "updated_at"]


class SubCategorySerializer(serializers.ModelSerializer):
    # category = CategorySerializer()

    class Meta:
        model = SubCategory
        fields = ["id", "category", "name"]


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "contact_person",
            "email",
            "status",
            "category",
            "subcategory",
        ]
