from rest_framework import serializers
from .models import LostFoundItem
from apps.authentication.serializers import UserProfileSerializer

class LostFoundItemSerializer(serializers.ModelSerializer):
    reported_by = UserProfileSerializer(read_only=True)
    claimed_by = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = LostFoundItem
        fields = [
            'id', 'item_name', 'description', 'category', 'location',
            'status', 'contact_info', 'reported_by', 'claimed_by',
            'created_at', 'updated_at', 'claimed_at'
        ]
        read_only_fields = ['reported_by', 'claimed_by', 'created_at', 'updated_at', 'claimed_at']

class LostFoundItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostFoundItem
        fields = [
            'item_name', 'description', 'category', 'location',
            'status', 'contact_info'
        ]

class LostFoundItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostFoundItem
        fields = ['status', 'claimed_by']
        read_only_fields = ['claimed_by']
