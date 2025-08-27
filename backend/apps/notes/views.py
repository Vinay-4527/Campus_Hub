from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Note
from .serializers import (
    NoteSerializer,
    NoteCreateSerializer,
    NoteUpdateSerializer
)

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.filter(is_public=True)
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'uploaded_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'downloads']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return NoteCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return NoteUpdateSerializer
        return NoteSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == 'admin':
            return Note.objects.all()
        return queryset

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        note = self.get_object()
        if note.file:
            note.increment_downloads()
            response = HttpResponse(note.file, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{note.file.name}"'
            return response
        elif note.file_url:
            note.increment_downloads()
            return Response({'file_url': note.file_url})
        return Response({'error': 'No file available'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def my_notes(self, request):
        queryset = self.queryset.filter(uploaded_by=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular_notes(self, request):
        queryset = self.queryset.order_by('-downloads')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_notes(self, request):
        queryset = self.queryset.order_by('-created_at')[:10]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
