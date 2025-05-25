# urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    InventoryDetailViewSet,
    InventoryViewSet,
    ProductCategoryDetailViewSet,
    ProductCategoryViewSet,
)

urlpatterns = [
    path("inventories/", InventoryViewSet.as_view()),
    path("inventories/<uuid:id>/", InventoryViewSet.as_view()),
    path("product-categories/", ProductCategoryViewSet.as_view()),
    path("product-categories/<uuid:id>/", ProductCategoryDetailViewSet.as_view()),
]
