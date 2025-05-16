from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin
from user import models

@admin.register(models.User)
class UserModelAdmin(UserAdmin):
    ordering = ('email',)
    list_display = ['email', 'id']
    list_display_links =['email', 'id']
    search_fields = ("email",)
    readonly_fields = ['created_at', 'updated_at']