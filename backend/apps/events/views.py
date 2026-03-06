from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, EventRegistration, EventProposal
from .serializers import (
    EventSerializer,
    EventCreateSerializer,
    EventUpdateSerializer,
    EventRegistrationSerializer,
    EventProposalSerializer
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

    @action(detail=False, methods=['get', 'post'])
    def proposals(self, request):
        user = request.user

        if request.method.lower() == 'post':
            if getattr(user, 'role', None) != 'student' or not getattr(user, 'is_class_representative', False):
                return Response(
                    {'detail': 'Only class representatives can submit event proposals.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = EventProposalSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(proposed_by=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        if getattr(user, 'role', None) == 'admin':
            queryset = EventProposal.objects.all()
        else:
            queryset = EventProposal.objects.filter(proposed_by=user)
        serializer = EventProposalSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path=r'proposals/(?P<proposal_id>[^/.]+)/review')
    def review_proposal(self, request, proposal_id=None):
        if getattr(request.user, 'role', None) != 'admin':
            return Response({'detail': 'Only admins can review proposals.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            proposal = EventProposal.objects.get(pk=proposal_id)
        except EventProposal.DoesNotExist:
            return Response({'detail': 'Proposal not found.'}, status=status.HTTP_404_NOT_FOUND)

        if proposal.proposal_status != 'pending':
            return Response({'detail': 'This proposal has already been reviewed.'}, status=status.HTTP_400_BAD_REQUEST)

        review_action = request.data.get('action')
        admin_comment = request.data.get('admin_comment', '')
        if review_action not in {'approve', 'reject'}:
            return Response({'detail': 'action must be either approve or reject.'}, status=status.HTTP_400_BAD_REQUEST)

        proposal.reviewed_by = request.user
        proposal.reviewed_at = timezone.now()
        proposal.admin_comment = admin_comment

        if review_action == 'approve':
            created_event = Event.objects.create(
                title=proposal.title,
                description=proposal.description,
                event_type=proposal.event_type,
                location=proposal.location,
                start_date=proposal.start_date,
                end_date=proposal.end_date,
                max_participants=proposal.max_participants,
                status=proposal.status,
                image=proposal.image,
                organizer=proposal.proposed_by
            )
            proposal.proposal_status = 'approved'
            proposal.created_event = created_event
        else:
            proposal.proposal_status = 'rejected'

        proposal.save(update_fields=[
            'reviewed_by', 'reviewed_at', 'admin_comment', 'proposal_status', 'created_event'
        ])
        serializer = EventProposalSerializer(proposal)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
