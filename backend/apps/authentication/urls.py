from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    user_logout_view,
    UserProfileView,
    user_profile_view,
    ChangePasswordView
)

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('', UserLoginView.as_view(), name='auth_root'),  # Default to login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', user_logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Profile endpoints (use APIView for JWT auth)
    path('profile/', UserProfileView.as_view(), name='profile'),
]
