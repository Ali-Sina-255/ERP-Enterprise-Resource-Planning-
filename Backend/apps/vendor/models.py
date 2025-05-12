from django.db import models

from apps.common.models import TimeStampedUUIDModel


class Category(TimeStampedUUIDModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class SubCategory(TimeStampedUUIDModel):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="subcategories"
    )
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.category.name} → {self.name}"


class Vendor(TimeStampedUUIDModel):
    class StatusChoices(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        PENDING = "pending", "Pending"
        REVIEW = "review", "Review"
        ON_HOLD = "on-hold", "On Hold"
        SUSPEND = "suspend", "Suspend"

    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=300)
    address = models.CharField(max_length=255)
    email = models.EmailField(unique=True, max_length=50)
    status = models.CharField(
        max_length=10, choices=StatusChoices.choices, default=StatusChoices.PENDING
    )

    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )
    subcategory = models.ForeignKey(
        SubCategory, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self):
        return self.name
