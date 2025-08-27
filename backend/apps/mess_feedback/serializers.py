from rest_framework import serializers
from .models import MessFeedback
from apps.authentication.serializers import UserProfileSerializer

class MessFeedbackSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    rating_display = serializers.CharField(source='rating_display', read_only=True)
    
    class Meta:
        model = MessFeedback
        fields = [
            'id', 'user', 'meal_type', 'rating', 'rating_display',
            'comments', 'date', 'created_at'
        ]
        read_only_fields = ['user', 'date', 'created_at']

class MessFeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessFeedback
        fields = ['meal_type', 'rating', 'comments']

class MessFeedbackStatsSerializer(serializers.Serializer):
    meal_type = serializers.CharField()
    average_rating = serializers.FloatField()
    total_feedbacks = serializers.IntegerField()
    positive_feedbacks = serializers.IntegerField()
    negative_feedbacks = serializers.IntegerField()
