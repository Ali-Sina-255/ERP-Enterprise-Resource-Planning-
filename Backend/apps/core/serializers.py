from rest_framework import serializers

from .models import CoreCategory


class CoreCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CoreCategory
        fields = ["id", "name", "created_at", "updated_at"]
