from django.db import models
from django.conf import settings

class LostFoundItem(models.Model):
    STATUS_CHOICES = [
        ('lost', 'Lost'),
        ('found', 'Found'),
        ('claimed', 'Claimed'),
        ('returned', 'Returned'),
    ]
    
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('books', 'Books'),
        ('clothing', 'Clothing'),
        ('accessories', 'Accessories'),
        ('documents', 'Documents'),
        ('other', 'Other'),
    ]
    
    item_name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lost')
    contact_info = models.CharField(max_length=200, blank=True)
    
    # User who reported the item
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reported_items'
    )
    
    # User who claimed the item (if applicable)
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claimed_items'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lost/Found Item'
        verbose_name_plural = 'Lost/Found Items'
    
    def __str__(self):
        return f"{self.get_status_display()} - {self.item_name}"
    
    @property
    def is_available(self):
        return self.status in ['lost', 'found']
    
    @property
    def is_claimed(self):
        return self.status in ['claimed', 'returned']
