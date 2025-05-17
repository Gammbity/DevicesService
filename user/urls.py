from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('master/', views.LoginView.as_view(), name='login'),
    path('profile/', views.ProfileView.as_view(), name='user_profile'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]
