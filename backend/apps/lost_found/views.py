from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import LostFoundItem
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

    def get_serializer_class(self):
        if self.action == 'create':
            return LostFoundItemCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LostFoundItemUpdateSerializer
        return LostFoundItemSerializer

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

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
