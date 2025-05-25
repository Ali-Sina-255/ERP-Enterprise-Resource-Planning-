from apps.core.models import Stock
from rest_framework import serializers

from .models import Inventory, ProductCategory


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "created_at", "updated_at"]


class InventorySerializer(serializers.ModelSerializer):
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = [
            "product_name",
            "sku",
            "category",
            "current_stock",
            "cost_price",
            "selling_price",
            "vendor",
            "low_stock_threshold",
            "created_at",
            "updated_at",
        ]

    def get_current_stock(self, obj):
        # Dynamically fetch the first related Stock object and get its current_stock value
        stock = obj.stock_items.first()  # Get the first related Stock object
        if stock:
            return stock.current_stock  # Return the current_stock from Stock
        return 0  # Return 0 if no related Stock object is found

    def create(self, validated_data):
        # Create Inventory object first
        inventory = Inventory.objects.create(**validated_data)

        # Create the related Stock object and associate it with the Inventory object
        stock = Stock.objects.create(
            product=inventory,  # Link Stock to Inventory
            stock_in=0,
            stock_out=0,
        )

        # Optionally, update the current_stock field in Inventory (calculated in Stock)
        inventory.save()  # Save the Inventory with its linked Stock

        return inventory
