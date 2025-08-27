from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LostFoundItemViewSet

router = DefaultRouter()
router.register(r'items', LostFoundItemViewSet, basename='lostfounditem')

app_name = 'lost_found'

urlpatterns = [
    path('', include(router.urls)),
]



