from apps.common.models import TimeStampedUUIDModel
from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.
class CoreCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


from apps.inventory.models import Inventory


class Stock(TimeStampedUUIDModel):
    product = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name="stock_items",
        verbose_name=_("Product"),
    )
    quantity = models.PositiveIntegerField(_("Quantity"), default=0)

    stock_in = models.PositiveIntegerField(_("Stock In"), default=0)
    stock_out = models.PositiveIntegerField(_("Stock Out"), default=0)
    current_stock = models.PositiveIntegerField(_("Current Stock"), default=0)

    class Meta:
        verbose_name = _("Stock")
        verbose_name_plural = _("Stocks")

    def save(self, *args, **kwargs):
        self.current_stock = self.stock_in - self.stock_out
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Stock for {self.product.product_name} - {self.current_stock} units"
