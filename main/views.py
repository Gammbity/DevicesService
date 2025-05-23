from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework.response import Response

from . import serializers
from . import models
from . import permissions

User = get_user_model()

class ProductListView(generics.ListAPIView):
    queryset = models.Product.objects.all()
    serializer_class = serializers.ProductSerializer
    permission_classes = [permissions.IsStaffUser]


class DeviceCreateView(generics.CreateAPIView):
    queryset = models.Device.objects.all()
    serializer_class = serializers.DeviceCreateSerializer
    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # <<< MUHIM QADAM
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)

class DeviceListView(generics.ListAPIView):
    queryset = models.Device.objects.all()
    serializer_class = serializers.DeviceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return self.queryset.filter(user=user)
        return self.queryset.none()

class DeviceDetailView(generics.RetrieveUpdateAPIView):
    queryset = models.Device.objects.all()
    serializer_class = serializers.DeviceSerializer

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied(_("You do not have permission to access this device."))
        return obj

class DeviceListMasterView(generics.ListAPIView):
    queryset = models.Device.objects.all()
    serializer_class = serializers.DeviceSerializer
    permission_classes = [permissions.IsStaffUser]

class DeviceDetailMasterView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Device.objects.all()
    serializer_class = serializers.DeviceSerializer
    permission_classes = [permissions.IsStaffUser]
