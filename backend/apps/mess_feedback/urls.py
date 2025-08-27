from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessFeedbackViewSet

router = DefaultRouter()
router.register(r'feedbacks', MessFeedbackViewSet, basename='messfeedback')

app_name = 'mess_feedback'

urlpatterns = [
    path('', include(router.urls)),
]



