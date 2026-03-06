from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import MessFeedback, MessFeedbackImage
from .serializers import (
    MessFeedbackSerializer,
    MessFeedbackCreateSerializer,
    MessFeedbackStatsSerializer
)

class MessFeedbackViewSet(viewsets.ModelViewSet):
    queryset = MessFeedback.objects.all()
    serializer_class = MessFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['meal_type', 'rating', 'date']
    search_fields = ['comments']
    ordering_fields = ['created_at', 'date', 'rating']
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

    def _attach_feedback_images(self, feedback, extra_images):
        files = list(extra_images or [])
        if not feedback.image and files:
            feedback.image = files.pop(0)
            feedback.save(update_fields=['image'])
        for file_obj in files:
            MessFeedbackImage.objects.create(feedback=feedback, image=file_obj)

    def get_serializer_class(self):
        if self.action == 'create':
            return MessFeedbackCreateSerializer
        return MessFeedbackSerializer

    def create(self, request, *args, **kwargs):
        _, extra_images, image_error = self._extract_images(request)
        if image_error:
            return image_error
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save(user=request.user)
        self._attach_feedback_images(feedback, extra_images)
        return Response(MessFeedbackSerializer(feedback, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_feedbacks(self, request):
        queryset = self.queryset.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Get date range (last 7 days by default)
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Filter by date range
        queryset = self.queryset.filter(date__range=[start_date, end_date])
        
        # Calculate stats by meal type
        stats = []
        meal_choices = dict(MessFeedback.MEAL_CHOICES)
        meal_types = [choice[0] for choice in MessFeedback.MEAL_CHOICES]
        
        for meal_type in meal_types:
            meal_feedbacks = queryset.filter(meal_type=meal_type)
            
            if meal_feedbacks.exists():
                avg_rating = meal_feedbacks.aggregate(Avg('rating'))['rating__avg']
                total_count = meal_feedbacks.count()
                positive_count = meal_feedbacks.filter(rating__gte=4).count()
                negative_count = meal_feedbacks.filter(rating__lt=4).count()
                
                stats.append({
                    'meal_type': meal_type,
                    'meal_type_display': meal_choices.get(meal_type, meal_type),
                    'average_rating': round(avg_rating, 2),
                    'total_feedbacks': total_count,
                    'positive_feedbacks': positive_count,
                    'negative_feedbacks': negative_count
                })
        
        serializer = MessFeedbackStatsSerializer(stats, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today_feedbacks(self, request):
        today = timezone.now().date()
        queryset = self.queryset.filter(date=today)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        # Get weekly summary for admin view
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        queryset = self.queryset.filter(date__range=[start_date, end_date])
        
        summary = {
            'total_feedbacks': queryset.count(),
            'average_rating': round(queryset.aggregate(Avg('rating'))['rating__avg'] or 0, 2),
            'positive_feedbacks': queryset.filter(rating__gte=4).count(),
            'negative_feedbacks': queryset.filter(rating__lt=4).count(),
            'by_meal_type': {}
        }
        
        # Breakdown by meal type
        for meal_type in [choice[0] for choice in MessFeedback.MEAL_CHOICES]:
            meal_feedbacks = queryset.filter(meal_type=meal_type)
            if meal_feedbacks.exists():
                summary['by_meal_type'][meal_type] = {
                    'count': meal_feedbacks.count(),
                    'average_rating': round(meal_feedbacks.aggregate(Avg('rating'))['rating__avg'], 2)
                }
        
        return Response(summary)
