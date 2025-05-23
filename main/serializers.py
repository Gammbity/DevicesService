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
        read_only_fields = ["created_at", "updated_at"]
    
class DeviceCreateSerializer(serializers.ModelSerializer):
    email = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    user = user_serializers.UserSerializer(read_only=True)

    class Meta:
        model = models.Device
        fields = "__all__"
        extra_kwargs = {
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context['request']
        user = request.user if request.user.is_authenticated else None

        email = validated_data.pop('email', None)
        username = validated_data.pop('username', None)

        if not user:
            if not email or not username:
                raise serializers.ValidationError("Email va username kerak.")
            user = User.objects.create_user(email=email, name=username)

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