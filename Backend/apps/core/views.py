from rest_framework import generics, permissions

from .models import CoreCategory, Stock
from .serializers import CoreCategorySerializer, StockSerializer


class StockAPIView(generics.ListCreateAPIView):
    queryset = Stock.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = StockSerializer


class CoreCreateApiViewSet(generics.ListCreateAPIView):
    queryset = CoreCategory.objects.all()
    serializer_class = CoreCategorySerializer
    permission_classes = [permissions.AllowAny]


class CoreRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CoreCategory.objects.all()
    serializer_class = CoreCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
