from rest_framework import serializers
from .models import LostFoundItem
from apps.authentication.serializers import UserProfileSerializer
import re

class LostFoundItemSerializer(serializers.ModelSerializer):
    reported_by = UserProfileSerializer(read_only=True)
    claimed_by = UserProfileSerializer(read_only=True)
    image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = LostFoundItem
        fields = [
            'id', 'item_name', 'description', 'category', 'location',
            'status', 'primary_phone', 'secondary_phone', 'image', 'image_urls', 'reported_by', 'claimed_by',
            'created_at', 'updated_at', 'claimed_at'
        ]
        read_only_fields = ['reported_by', 'claimed_by', 'created_at', 'updated_at', 'claimed_at']

    def get_image_urls(self, obj):
        urls = []
        if obj.image:
            urls.append(obj.image.url)
        urls.extend([img.image.url for img in obj.images.all()])
        deduped = []
        seen = set()
        for url in urls:
            if url in seen:
                continue
            seen.add(url)
            deduped.append(url)
            if len(deduped) == 5:
                break
        return deduped

class LostFoundItemCreateSerializer(serializers.ModelSerializer):
    primary_phone = serializers.CharField(required=True, allow_blank=False)
    secondary_phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = LostFoundItem
        fields = [
            'item_name', 'description', 'category', 'location',
            'primary_phone', 'secondary_phone', 'image'
        ]

    def _normalize_and_validate_phone(self, value: str, field_label: str) -> str:
        raw = (value or '').strip()
        if not raw:
            return ''

        # Accept common separators but store normalized format.
        normalized = re.sub(r'[\s\-\(\)]', '', raw)
        if normalized.startswith('+'):
            digits = normalized[1:]
            if not digits.isdigit():
                raise serializers.ValidationError(f'{field_label} must contain only digits after +.')
            digit_count = len(digits)
        else:
            if not normalized.isdigit():
                raise serializers.ValidationError(f'{field_label} must contain only digits.')
            digit_count = len(normalized)

        if digit_count < 10 or digit_count > 15:
            raise serializers.ValidationError(f'{field_label} must be between 10 and 15 digits.')

        return normalized

    def validate_primary_phone(self, value):
        normalized = self._normalize_and_validate_phone(value, 'Primary phone')
        if not normalized:
            raise serializers.ValidationError('Primary phone is required.')
        return normalized

    def validate_secondary_phone(self, value):
        # Optional field, but if provided it must be valid.
        return self._normalize_and_validate_phone(value, 'Secondary phone')

class LostFoundItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LostFoundItem
        fields = ['status', 'claimed_by']
        read_only_fields = ['claimed_by']
