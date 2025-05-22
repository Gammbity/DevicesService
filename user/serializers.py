import json
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import permissions

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    """
    class Meta:
        model = User
        fields = ['id', 'email']
        extra_kwargs = {
            'email': {'read_only': True},
        }

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found.')

        if not user.check_password(password):
            raise serializers.ValidationError('Incorrect password.')

        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    email = serializers.EmailField(required=True, error_messages={
        'required': _('Email is required.')
    })
    
    class Meta:
        model = User
        fields = ['email']
        extra_kwargs = {
            'email': {'write_only': True}
        }
    
    def create(self, validated_data):
        user, created = User.objects.get_or_create(email=validated_data['email'])
        return user

