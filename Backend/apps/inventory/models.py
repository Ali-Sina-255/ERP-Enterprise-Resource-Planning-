from apps.common.models import TimeStampedUUIDModel
from apps.vendor.models import Vendor
from django.db import models
from django.utils.translation import gettext_lazy as _


class ProductCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


# Create your models here.
class Inventory(TimeStampedUUIDModel):
    product_name = models.CharField(verbose_name=_("Inventory"), max_length=250)
    sku = models.CharField(max_length=255)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    low_stock_threshold = models.PositiveSmallIntegerField()

    class Meta:
        verbose_name = _("Inventory")
        verbose_name_plural = _("Inventories")

    def __str__(self):
        return self.product_name
