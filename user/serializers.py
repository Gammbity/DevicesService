from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

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
    """
    Serializer for user login.
    """
    email = serializers.EmailField(required=True, error_messages={
        'required': _('Email is required.'),
        'invalid': _('Enter a valid email address.')
    })
    password = serializers.CharField(required=True, write_only=True, error_messages={
        'required': _('Password is required.')
    })
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError(_('User with this email does not exist.'))
        
        user = User.objects.get(email=email)
        
        if not user.check_password(password):
            raise serializers.ValidationError(_('Incorrect password.'))
        return user
    
    
class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    email = serializers.EmailField(write_only=True, required=True, error_messages={
        'required': _('Email is required.')
    })
    
    class Meta:
        model = User
        fields = ['email']
        extra_kwargs = {
            'email': {'write_only': True}
        }
    
    def create(self, validated_data):
        user = User(
            email=validated_data['email']
        )
        user.save()
        return user

