from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import LostFoundItem, LostFoundItemImage
from .serializers import (
    LostFoundItemSerializer,
    LostFoundItemCreateSerializer,
    LostFoundItemUpdateSerializer
)

class LostFoundItemViewSet(viewsets.ModelViewSet):
    queryset = LostFoundItem.objects.all()
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['item_name', 'description', 'location']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

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

    def _attach_item_images(self, item, extra_images):
        files = list(extra_images or [])
        if not item.image and files:
            item.image = files.pop(0)
            item.save(update_fields=['image'])
        for file_obj in files:
            LostFoundItemImage.objects.create(item=item, image=file_obj)

    def get_serializer_class(self):
        if self.action == 'create':
            return LostFoundItemCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LostFoundItemUpdateSerializer
        return LostFoundItemSerializer

    def create(self, request, *args, **kwargs):
        _, extra_images, image_error = self._extract_images(request)
        if image_error:
            return image_error
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(reported_by=self.request.user, status='lost')
        self._attach_item_images(item, extra_images)
        return Response(LostFoundItemSerializer(item, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        is_admin = getattr(request.user, 'role', None) == 'admin'
        is_owner = item.reported_by_id == request.user.id
        if not (is_admin or is_owner):
            return Response(
                {'detail': 'Only the reporter or admin can delete this item.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user, status='lost')

    @action(detail=True, methods=['post'])
    def claim_item(self, request, pk=None):
        item = self.get_object()
        
        if item.status not in ['lost', 'found']:
            return Response(
                {'error': 'Item is not available for claiming'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.status = 'claimed'
        item.claimed_by = request.user
        item.claimed_at = timezone.now()
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_returned(self, request, pk=None):
        item = self.get_object()
        
        if item.status != 'claimed':
            return Response(
                {'error': 'Item must be claimed before marking as returned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.status = 'returned'
        item.save()
        
        serializer = self.get_serializer(item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_found(self, request, pk=None):
        item = self.get_object()

        if item.reported_by_id != request.user.id and getattr(request.user, 'role', None) != 'admin':
            return Response(
                {'error': 'Only the reporter or admin can mark this item as found'},
                status=status.HTTP_403_FORBIDDEN
            )

        if item.status == 'returned':
            return Response(
                {'error': 'Item is already resolved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.status = 'returned'
        item.save(update_fields=['status', 'updated_at'])

        serializer = self.get_serializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_items(self, request):
        queryset = self.queryset.filter(reported_by=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available_items(self, request):
        queryset = self.queryset.filter(status__in=['lost', 'found'])
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
