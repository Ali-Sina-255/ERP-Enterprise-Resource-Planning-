from django.urls import path

from . import views

urlpatterns = [
    path("stock/", views.StockAPIView.as_view()),
    path("core/", views.CoreCreateApiViewSet.as_view()),
    path("<uuid:id>/", views.CoreRetrieveUpdateDestroyAPIView.as_view()),
]
