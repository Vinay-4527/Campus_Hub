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
    rating = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField(blank=True)
    date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Mess Feedback'
        verbose_name_plural = 'Mess Feedbacks'
        unique_together = ['user', 'meal_type', 'date']  # One feedback per meal per day per user
    
    def __str__(self):
        return f"{self.user.username} - {self.get_meal_type_display()} - {self.date}"
    
    @property
    def rating_display(self):
        return dict(self.RATING_CHOICES)[self.rating]
    
    @property
    def is_positive(self):
        return self.rating >= 4
