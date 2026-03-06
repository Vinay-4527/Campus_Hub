from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Event, EventRegistration, EventProposal, EventImage, EventProposalImage
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

    def _extract_images(self, request):
        primary_image = request.FILES.get('image')
        extra_images = request.FILES.getlist('images')
        total = (1 if primary_image else 0) + len(extra_images)
        if total > 5:
            return None, None, Response(
                {'detail': 'Maximum 5 images are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return primary_image, extra_images, None

    def _attach_event_images(self, event, extra_images):
        # Keep first image in primary field when none was explicitly set.
        files = list(extra_images or [])
        if not event.image and files:
            event.image = files.pop(0)
            event.save(update_fields=['image'])
        for file_obj in files:
            EventImage.objects.create(event=event, image=file_obj)

    def _attach_proposal_images(self, proposal, extra_images):
        files = list(extra_images or [])
        if not proposal.image and files:
            proposal.image = files.pop(0)
            proposal.save(update_fields=['image'])
        for file_obj in files:
            EventProposalImage.objects.create(proposal=proposal, image=file_obj)

    def get_queryset(self):
        # Auto-cleanup: remove events after their end date has fully passed.
        # Keep events visible for the entire end date, even if end time has passed.
        today = timezone.localdate()
        Event.objects.filter(end_date__date__lt=today).delete()
        return Event.objects.all()

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
        _, extra_images, image_error = self._extract_images(request)
        if image_error:
            return image_error

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save(organizer=request.user)
        self._attach_event_images(event, extra_images)
        return Response(EventSerializer(event, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'admin':
            return Response(
                {'detail': 'Only admins can delete events.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'post'])
    def proposals(self, request):
        user = request.user

        if request.method.lower() == 'post':
            if getattr(user, 'role', None) != 'student' or not getattr(user, 'is_class_representative', False):
                return Response(
                    {'detail': 'Only class representatives can submit event proposals.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            _, extra_images, image_error = self._extract_images(request)
            if image_error:
                return image_error
            serializer = EventProposalSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            target_event = serializer.validated_data.get('target_event')
            if target_event and target_event.organizer_id != user.id:
                return Response(
                    {'detail': 'You can only propose edits for events you originally proposed.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            proposal = serializer.save(proposed_by=user)
            self._attach_proposal_images(proposal, extra_images)
            return Response(EventProposalSerializer(proposal, context={'request': request}).data, status=status.HTTP_201_CREATED)

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
            if proposal.target_event_id:
                target_event = proposal.target_event
                target_event.title = proposal.title
                target_event.description = proposal.description
                target_event.event_type = proposal.event_type
                target_event.location = proposal.location
                target_event.start_date = proposal.start_date
                target_event.end_date = proposal.end_date
                target_event.max_participants = proposal.max_participants
                target_event.status = proposal.status
                target_event.image = proposal.image
                target_event.save()
                target_event.images.all().delete()
                proposal_image_files = [image.image for image in proposal.images.all()]
                self._attach_event_images(target_event, proposal_image_files)
            else:
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
                proposal_image_files = [image.image for image in proposal.images.all()]
                self._attach_event_images(created_event, proposal_image_files)
                proposal.created_event = created_event
            proposal.proposal_status = 'approved'
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

        # Expired by time: no new registrations allowed.
        if timezone.now() > event.end_date:
            return Response(
                {'error': 'Event has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
