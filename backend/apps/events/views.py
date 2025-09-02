from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, EventRegistration
from .serializers import (
    EventSerializer,
    EventCreateSerializer,
    EventUpdateSerializer,
    EventRegistrationSerializer
)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'status', 'organizer']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        if self.action == 'create':
            return EventCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EventUpdateSerializer
        return EventSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        # Students cannot create events
        try:
            user_role = getattr(user, 'role', None)
        except Exception:  # pragma: no cover
            user_role = None
        if user_role == 'student':
            return Response({'detail': 'Students are not allowed to create events.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        # Check if user is already registered
        if EventRegistration.objects.filter(event=event, user=user).exists():
            return Response(
                {'error': 'You are already registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if event is full
        if event.is_full:
            return Response(
                {'error': 'Event is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create registration
        registration = EventRegistration.objects.create(event=event, user=user)
        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def unregister(self, request, pk=None):
        event = self.get_object()
        user = request.user
        
        try:
            registration = EventRegistration.objects.get(event=event, user=user)
            registration.delete()
            return Response({'message': 'Successfully unregistered'})
        except EventRegistration.DoesNotExist:
            return Response(
                {'error': 'You are not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        queryset = self.queryset.filter(
            start_date__gt=timezone.now(),
            status='upcoming'
        ).order_by('start_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_events(self, request):
        # Events organized by user
        organized = self.queryset.filter(organizer=request.user)
        # Events user is participating in
        participating = self.queryset.filter(participants=request.user)
        
        organized_serializer = self.get_serializer(organized, many=True)
        participating_serializer = self.get_serializer(participating, many=True)
        
        return Response({
            'organized': organized_serializer.data,
            'participating': participating_serializer.data
        })

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        event = self.get_object()
        registrations = EventRegistration.objects.filter(event=event)
        serializer = EventRegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
