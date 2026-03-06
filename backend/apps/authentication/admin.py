from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminApprovalRequest


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_class_representative', 'is_staff', 'is_active')
    list_filter = ('role', 'is_class_representative', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            'Campus Hub Fields',
            {'fields': ('role', 'student_id', 'phone_number', 'profile_picture', 'is_verified', 'is_class_representative')}
        ),
    )


@admin.register(AdminApprovalRequest)
class AdminApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'approver_email', 'approved', 'created_at', 'approved_at')
    list_filter = ('approved', 'department')
    search_fields = ('user__username', 'user__email', 'department', 'approver_email')
