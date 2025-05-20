from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('device/create/', views.DeviceCreateView.as_view(), name='device-create'),
    path('devices/<int:pk>/', views.DeviceDetailView.as_view(), name='device-detail'),
    path('devices/', views.DeviceListView.as_view(), name='device-list'),
    path('devices/master/', views.DeviceListMasterView.as_view(), name='device-list-master'),
    path('devices/master/<int:pk>/', views.DeviceDetailMasterView.as_view(), name='device-detail-master'),
]