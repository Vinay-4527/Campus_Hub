from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, AdminApprovalRequest
from django.utils.crypto import get_random_string
from django.conf import settings
from django.core.mail import send_mail

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    # Extra fields used when requesting admin role
    department = serializers.CharField(required=False, allow_blank=True)
    approver_email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'student_id',
            'phone_number', 'department', 'approver_email'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password_confirm')
        department = validated_data.pop('department', None)
        approver_email = validated_data.pop('approver_email', None)
        requested_role = validated_data.get('role', 'student')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        # If user requested admin, set role to student until approved and create approval request
        if requested_role == 'admin':
            user.role = 'student'
            user.save(update_fields=['password', 'role'])
            if department and approver_email:
                token = get_random_string(48)
                AdminApprovalRequest.objects.create(
                    user=user,
                    department=department,
                    approver_email=approver_email,
                    token=token,
                )
                approval_link = f"{settings.FRONTEND_BASE_URL if hasattr(settings, 'FRONTEND_BASE_URL') else 'http://localhost:3000'}/auth/admin-approve?token={token}"
                send_mail(
                    subject='Campus Hub - Admin Approval Request',
                    message=f"Please approve admin access for {user.get_full_name()} ({user.email}) in {department}.\nApprove: {approval_link}",
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@campushub.local'),
                    recipient_list=[approver_email],
                    fail_silently=True,
                )
        else:
            user.save(update_fields=['password'])

        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login (accepts username OR email + password)
    """
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        login_identifier = attrs.get('username')
        password = attrs.get('password')
        
        if not (login_identifier and password):
            raise serializers.ValidationError('Must include username/email and password')

        # If an email is provided, attempt to resolve to a username
        resolved_username = login_identifier
        if '@' in login_identifier:
            try:
                user_obj = User.objects.get(email__iexact=login_identifier)
                resolved_username = user_obj.username
            except User.DoesNotExist:
                # Fall back to provided identifier; authentication will fail below
                pass

        user = authenticate(username=resolved_username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled')

        attrs['user'] = user
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'student_id', 'phone_number', 'profile_picture',
            'is_verified', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'profile_picture'
        ]



