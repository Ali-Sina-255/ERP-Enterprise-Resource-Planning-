from django.db import models

from apps.common.models import TimeStampedUUIDModel


# Create your models here.
class CoreCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

