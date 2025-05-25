from rest_framework import serializers

from .models import CoreCategory, Stock


class CoreCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreCategory
        fields = ["id", "name", "created_at", "updated_at"]


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ["product", "stock_in", "stock_out", "current_stock"]
