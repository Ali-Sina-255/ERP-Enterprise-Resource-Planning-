from django.urls import path

from . import views

urlpatterns = [
    path("", views.CoreCreateApiViewSet.as_view()),
    path("<uuid:id>/", views.CoreRetrieveUpdateDestroyAPIView.as_view()),
]
