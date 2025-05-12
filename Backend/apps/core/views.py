from rest_framework import generics, permissions

from .models import CoreCategory
from .serializers import CoreCategorySerializer


class CoreCreateApiViewSet(generics.ListCreateAPIView):
    queryset = CoreCategory.objects.all()
    serializer_class = CoreCategorySerializer
    permission_classes = [permissions.AllowAny]


class CoreRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CoreCategory.objects.all()
    serializer_class = CoreCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
