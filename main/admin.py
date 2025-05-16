from django.contrib import admin

from . import models

@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "description", "price", "count", "created_at", "updated_at")
    search_fields = ("name",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 20
    list_display_links = ("name",)
    fieldsets = (
        (None, {"fields": ("name", "description")}),
        ("Price and Count", {"fields": ("price", "count")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_as_featured"]
    def mark_as_featured(self, request, queryset):
        for product in queryset:
            product.is_featured = True
            product.save()
        self.message_user(request, "Selected products marked as featured.")
    mark_as_featured.short_description = "Mark selected products as featured"
    mark_as_featured.allowed_permissions = ("change",)
    def has_add_permission(self, request):
        return request.user.is_superuser
    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser