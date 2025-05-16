from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from . import models

User = get_user_model()

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = "__all__"
        extra_kwargs = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
        read_only_fields = ["created_at", "updated_at"]