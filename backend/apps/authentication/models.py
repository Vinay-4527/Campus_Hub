from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User model with role-based authentication
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('faculty', 'Faculty'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    student_id = models.CharField(max_length=20, blank=True, null=True, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.URLField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_student(self):
        return self.role == 'student'
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_faculty(self):
        return self.role == 'faculty'


class AdminApprovalRequest(models.Model):
    """
    Tracks admin privilege approval requests per department.
    """
    user = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='admin_approval_requests')
    department = models.CharField(max_length=100)
    approver_email = models.EmailField()
    token = models.CharField(max_length=128, unique=True)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['department', 'approved']),
        ]
        verbose_name = 'Admin Approval Request'
        verbose_name_plural = 'Admin Approval Requests'

    def mark_approved(self):
        self.approved = True
        self.approved_at = timezone.now()
        self.save(update_fields=['approved', 'approved_at'])
