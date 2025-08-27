from rest_framework import serializers
from .models import Note
from apps.authentication.serializers import UserProfileSerializer

class NoteSerializer(serializers.ModelSerializer):
    uploaded_by = UserProfileSerializer(read_only=True)
    subject_display = serializers.CharField(source='get_subject_display', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'subject', 'subject_display',
            'file', 'file_url', 'uploaded_by', 'downloads', 'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'downloads', 'created_at', 'updated_at']

class NoteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['title', 'description', 'subject', 'file', 'file_url', 'is_public']

class NoteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['title', 'description', 'subject', 'file', 'file_url', 'is_public']
