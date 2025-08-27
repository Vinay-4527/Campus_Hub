from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    user_logout_view,
    UserProfileView,
    user_profile_view
)

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('', UserLoginView.as_view(), name='auth_root'),  # Default to login
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', user_logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('profile/', user_profile_view, name='profile'),
    path('profile/update/', UserProfileView.as_view(), name='profile_update'),
]
