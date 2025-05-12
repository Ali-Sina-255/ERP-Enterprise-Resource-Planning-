from django.urls import path

from . import views

urlpatterns = [
    path("", views.CategoryCrateApiView.as_view()),
    path("<uuid:id>/", views.CategoryRetrieveDestroyView.as_view()),
    path("sub-category/", views.SubCategoryApiViewSet.as_view()),
    path("sub-category/<uuid:id>/", views.SubCategoryRetrieveDestroyView.as_view()),
    path("vendors/", views.VendorListCreateView.as_view(), name="vendor-list-create"),
    path(
        "vendors/<uuid:id>/",
        views.VendorRetrieveUpdateDestroyView.as_view(),
        name="vendor-detail",
    ),
]
