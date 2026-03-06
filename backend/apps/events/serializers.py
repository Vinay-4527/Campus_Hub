from rest_framework import serializers
from .models import Event, EventRegistration, EventProposal
from apps.authentication.serializers import UserProfileSerializer


def validate_event_window(attrs, instance=None):
    start_date = attrs.get('start_date')
    end_date = attrs.get('end_date')

    if instance is not None:
        if start_date is None:
            start_date = instance.start_date
        if end_date is None:
            end_date = instance.end_date

    if start_date and end_date and end_date <= start_date:
        raise serializers.ValidationError({
            'end_date': 'End date and time must be after start date and time.'
        })

class EventRegistrationSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = ['id', 'user', 'registered_at', 'attended']
        read_only_fields = ['user', 'registered_at']

class EventSerializer(serializers.ModelSerializer):
    organizer = UserProfileSerializer(read_only=True)
    participants = UserProfileSerializer(many=True, read_only=True)
    registrations = EventRegistrationSerializer(source='eventregistration_set', many=True, read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_ongoing = serializers.BooleanField(read_only=True)
    image_urls = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'current_participants',
            'status', 'image', 'organizer', 'participants', 'registrations',
            'is_full', 'available_spots', 'is_upcoming', 'is_ongoing', 'image_urls',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'current_participants', 'created_at', 'updated_at']

    def get_image_urls(self, obj):
        urls = []
        if obj.image:
            urls.append(obj.image.url)
        urls.extend([img.image.url for img in obj.images.all()])
        # Preserve order and limit to 5.
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

class EventCreateSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        validate_event_window(attrs)
        return attrs

    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status', 'image'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
        }

class EventUpdateSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        validate_event_window(attrs, instance=self.instance)
        return attrs

    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status', 'image'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
        }


class EventProposalSerializer(serializers.ModelSerializer):
    proposed_by = UserProfileSerializer(read_only=True)
    reviewed_by = UserProfileSerializer(read_only=True)
    proposal_status_display = serializers.CharField(source='get_proposal_status_display', read_only=True)
    image_urls = serializers.SerializerMethodField()

    def validate(self, attrs):
        validate_event_window(attrs, instance=self.instance)
        return attrs

    class Meta:
        model = EventProposal
        fields = [
            'id', 'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status',
            'proposal_status', 'proposal_status_display', 'admin_comment',
            'proposed_by', 'reviewed_by', 'target_event', 'created_event', 'image', 'image_urls',
            'created_at', 'updated_at', 'reviewed_at'
        ]
        read_only_fields = [
            'proposal_status', 'admin_comment', 'proposed_by', 'reviewed_by',
            'created_event', 'created_at', 'updated_at', 'reviewed_at'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
        }

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
