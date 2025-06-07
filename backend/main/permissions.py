from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        """
        Check if the user is a staff member.
        """
        return request.user.is_staff
