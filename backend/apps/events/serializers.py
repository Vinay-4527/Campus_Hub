from rest_framework import serializers
from .models import Event, EventRegistration, EventProposal
from apps.authentication.serializers import UserProfileSerializer

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
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'current_participants',
            'status', 'image', 'organizer', 'participants', 'registrations',
            'is_full', 'available_spots', 'is_upcoming', 'is_ongoing',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'current_participants', 'created_at', 'updated_at']

class EventCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status', 'image'
        ]

class EventUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status', 'image'
        ]


class EventProposalSerializer(serializers.ModelSerializer):
    proposed_by = UserProfileSerializer(read_only=True)
    reviewed_by = UserProfileSerializer(read_only=True)
    proposal_status_display = serializers.CharField(source='get_proposal_status_display', read_only=True)

    class Meta:
        model = EventProposal
        fields = [
            'id', 'title', 'description', 'event_type', 'location',
            'start_date', 'end_date', 'max_participants', 'status',
            'proposal_status', 'proposal_status_display', 'admin_comment',
            'proposed_by', 'reviewed_by', 'created_event', 'image',
            'created_at', 'updated_at', 'reviewed_at'
        ]
        read_only_fields = [
            'proposal_status', 'admin_comment', 'proposed_by', 'reviewed_by',
            'created_event', 'created_at', 'updated_at', 'reviewed_at'
        ]
