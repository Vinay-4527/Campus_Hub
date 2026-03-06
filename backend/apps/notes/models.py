from django.db import models
from django.conf import settings

class Note(models.Model):
    SUBJECT_CHOICES = [
        ('computer_science', 'Computer Science'),
        ('mathematics', 'Mathematics'),
        ('physics', 'Physics'),
        ('chemistry', 'Chemistry'),
        ('biology', 'Biology'),
        ('engineering', 'Engineering'),
        ('business', 'Business'),
        ('arts', 'Arts'),
        ('literature', 'Literature'),
        ('history', 'History'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES, default='other')
    file = models.FileField(upload_to='notes/', blank=True, null=True)
    file_url = models.URLField(blank=True, null=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_notes')
    downloads = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Note'
        verbose_name_plural = 'Notes'
    
    def __str__(self):
        return f"{self.title} - {self.get_subject_display()}"
    
    def increment_downloads(self):
        self.downloads += 1
        self.save(update_fields=['downloads'])
