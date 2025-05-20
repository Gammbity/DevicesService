from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from . import models
from user import serializers as user_serializers

User = get_user_model()

class DeviceSerializer(serializers.ModelSerializer):
    user = user_serializers.UserSerializer(read_only=True)
    class Meta:
        model = models.Device
        fields = "__all__"
        extra_kwargs = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
        read_only_fields = ["created_at", "updated_at", "price", "status", "end_time", "user"]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = "__all__"
        extra_kwargs = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
        read_only_fields = ["created_at", "updated_at"]