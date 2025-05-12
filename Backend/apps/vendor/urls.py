from django.urls import path

from . import views

urlpatterns = [
    path("", views.CategoryCrateApiView.as_view()),
    path("<uuid:id>/", views.CategoryRetrieveDestroyView.as_view()),
    path("sub-category/", views.SubCategoryApiViewSet.as_view()),
    path("sub-category/<uuid:id>/", views.SubCategoryRetrieveDestroyView.as_view()),
]
