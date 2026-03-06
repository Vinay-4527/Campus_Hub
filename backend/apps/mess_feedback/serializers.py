from rest_framework import serializers
from .models import MessFeedback
from apps.authentication.serializers import UserProfileSerializer

MEAL_SUBTYPE_CHOICES = {
    'breakfast': ['tiffins', 'beverages', 'other'],
    'lunch': ['rice', 'roti', 'curry', 'dal', 'other'],
    'dinner': ['rice', 'roti', 'curry', 'dal', 'other'],
    'snack': ['tea', 'coffee', 'fried', 'bakery', 'other'],
}


class MessFeedbackSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    rating_display = serializers.CharField(read_only=True)
    meal_type_display = serializers.CharField(source='get_meal_type_display', read_only=True)
    meal_subtype_display = serializers.SerializerMethodField()
    image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = MessFeedback
        fields = [
            'id', 'user', 'meal_type', 'meal_type_display', 'meal_subtype', 'meal_subtype_custom', 'meal_subtype_display', 'rating', 'rating_display',
            'comments', 'image', 'image_urls', 'date', 'created_at'
        ]
        read_only_fields = ['user', 'date', 'created_at']

    def get_meal_subtype_display(self, obj):
        if obj.meal_subtype == 'other' and obj.meal_subtype_custom:
            return obj.meal_subtype_custom
        return obj.meal_subtype.replace('_', ' ').title() if obj.meal_subtype else ''

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

class MessFeedbackCreateSerializer(serializers.ModelSerializer):
    meal_subtype = serializers.CharField(required=False, allow_blank=True)
    meal_subtype_custom = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = MessFeedback
        fields = ['meal_type', 'meal_subtype', 'meal_subtype_custom', 'rating', 'comments', 'image']

    def validate(self, attrs):
        meal_type = attrs.get('meal_type')
        meal_subtype = (attrs.get('meal_subtype') or '').strip().lower().replace(' ', '_')
        meal_subtype_custom = (attrs.get('meal_subtype_custom') or '').strip()

        allowed_subtypes = MEAL_SUBTYPE_CHOICES.get(meal_type, [])
        if meal_subtype and meal_subtype not in allowed_subtypes:
            raise serializers.ValidationError({
                'meal_subtype': f"Invalid option for {meal_type}. Allowed values: {', '.join(allowed_subtypes)}"
            })

        if not meal_subtype and allowed_subtypes:
            attrs['meal_subtype'] = allowed_subtypes[0]
        else:
            attrs['meal_subtype'] = meal_subtype

        if attrs['meal_subtype'] == 'other':
            if not meal_subtype_custom:
                raise serializers.ValidationError({
                    'meal_subtype_custom': 'Please specify what this "Other" category is.'
                })
            attrs['meal_subtype_custom'] = meal_subtype_custom
        else:
            attrs['meal_subtype_custom'] = ''

        return attrs

class MessFeedbackStatsSerializer(serializers.Serializer):
    meal_type = serializers.CharField()
    meal_type_display = serializers.CharField()
    average_rating = serializers.FloatField()
    total_feedbacks = serializers.IntegerField()
    positive_feedbacks = serializers.IntegerField()
    negative_feedbacks = serializers.IntegerField()
