from django.db import models
from django.conf import settings

class MessFeedback(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    
    RATING_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mess_feedbacks'
    )
    
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    meal_subtype = models.CharField(max_length=50, blank=True, default='')
    meal_subtype_custom = models.CharField(max_length=100, blank=True, default='')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True)
    image = models.ImageField(upload_to='mess_feedback/', blank=True, null=True)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mess Feedback'
        verbose_name_plural = 'Mess Feedbacks'
        unique_together = ['user', 'meal_type', 'date']  # One feedback per meal per day per user
    
    def __str__(self):
        subtype_value = self.meal_subtype_custom if self.meal_subtype == 'other' and self.meal_subtype_custom else self.meal_subtype
        subtype = f" ({subtype_value})" if subtype_value else ""
        return f"{self.user.username} - {self.get_meal_type_display()}{subtype} - {self.date}"
    
    @property
    def rating_display(self):
        return dict(self.RATING_CHOICES)[self.rating]
    
    @property
    def is_positive(self):
        return self.rating >= 4


class MessFeedbackImage(models.Model):
    feedback = models.ForeignKey(MessFeedback, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='mess_feedback/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
