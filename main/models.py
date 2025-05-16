from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _


User = get_user_model()


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name=_("Product Name"))
    description = models.TextField(verbose_name=_("Product Description"))
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Product Price"))
    count = models.PositiveIntegerField(verbose_name=_("Product Count"), default=1)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def __str__(self):
        return self.name

class Device(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="devices", verbose_name=_("User"))
    name = models.CharField(max_length=255, verbose_name=_("Device Name"))
    description = models.TextField(verbose_name=_("Device Description"))
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Service Price"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Device")
        verbose_name_plural = _("Devices")

    def __str__(self):
        return self.name