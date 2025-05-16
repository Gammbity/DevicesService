from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import login, logout, authenticate


from . import serializers
from . import models

def response_token_cookie(user):
    refresh_token = RefreshToken.for_user(user)
    access = str(refresh_token.access_token)
    response = Response({'access_token': access})
    response.set_cookie(
        key="refresh_token",
        value=str(refresh_token),
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=3600
    )
    return response


class LoginView(generics.GenericAPIView):
    """
    View for user login.
    """
    queryset = models.User.objects.all()
    serializer_class = serializers.LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        login(request, user)
        response = response_token_cookie(user)
        return response 
    
class RegisterView(generics.GenericAPIView):
    """
    View for user registration.
    """
    serializer_class = serializers.RegisterSerializer
    queryset = models.User.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProfileView(generics.RetrieveAPIView):
    """
    View for user profile.
    """
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.all( )
    
    def get_object(self):
        return self.request.user