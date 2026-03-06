from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    user_profile_view
)

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('', UserLoginView.as_view(), name='auth_root'),  # Default to login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints (use APIView for JWT auth)
    path('profile/', UserProfileView.as_view(), name='profile'),
]
