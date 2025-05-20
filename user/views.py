from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view

from django.utils.translation import gettext_lazy as _
from django.contrib.auth import login, logout, authenticate
from django.core import signing
from django.shortcuts import redirect

from . import serializers
from . import models
from . import tasks

# ✅ Tokenni tekshirish va emailni olish
def decode_token(token):
    from django.core import signing
    try:
        data = signing.loads(token, max_age=900)  # 15 daqiqa
        return data['email']
    except signing.SignatureExpired:
        return "Token muddati tugagan"
    except signing.BadSignature:
        return "Token noto‘g‘ri"


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
        return Response({
            "detail": _("Login successful."),
            "email": user.email
        }, status=status.HTTP_200_OK)
    
class RegisterView(generics.GenericAPIView):
    """
    View for user registration.
    """
    serializer_class = serializers.RegisterSerializer
    queryset = models.User.objects.all()
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tasks.send_welcome_email.delay(request.data['email'])
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ProfileView(generics.RetrieveAPIView):
    """
    View for user profile.
    """
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.all( )
    
    def get_object(self):
        return self.request.user
    
@api_view(['GET'])
def token_verify(request, token):
    
    if not token:
        return Response({"detail": "Token yuborilmagan"}, status=status.HTTP_400_BAD_REQUEST)

    if models.TokenVerify.objects.filter(token=token).exists():
        return Response({"detail": "Token allaqachon ishlatilgan"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email = decode_token(token)
    except signing.SignatureExpired:
        return Response({"detail": "Token muddati tugagan"}, status=status.HTTP_400_BAD_REQUEST)
    except signing.BadSignature:
        return Response({"detail": "Token noto‘g‘ri"}, status=status.HTTP_400_BAD_REQUEST)

    if not models.User.objects.filter(email=email).exists():
        return Response({"detail": "Foydalanuvchi topilmadi"}, status=status.HTTP_404_NOT_FOUND)
    
    user = models.User.objects.get(email=email)
    login(request, user)
    models.TokenVerify.objects.create(token=token)
    return redirect("http://127.0.0.1:8000/api/v1/user/profile")  # Redirect to the desired URL after successful login

class LogoutView(views.APIView):
    """
    View for user logout and refresh token blacklisting.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        logout(request)
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        return response
