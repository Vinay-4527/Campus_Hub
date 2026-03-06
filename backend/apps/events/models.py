from django.db import models
from django.conf import settings

class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ('academic', 'Academic'),
        ('cultural', 'Cultural'),
        ('sports', 'Sports'),
        ('technical', 'Technical'),
        ('social', 'Social'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='other')
    location = models.CharField(max_length=200)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    current_participants = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    image = models.ImageField(upload_to='events/', blank=True, null=True)
    
    # Organizer
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )
    
    # Participants (many-to-many relationship)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='EventRegistration',
        related_name='participated_events'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return f"{self.title} - {self.start_date.strftime('%Y-%m-%d')}"
    
    @property
    def is_full(self):
        if self.max_participants is None:
            return False
        return self.current_participants >= self.max_participants
    
    @property
    def available_spots(self):
        if self.max_participants is None:
            return None
        return max(0, self.max_participants - self.current_participants)
    
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.start_date > timezone.now()
    
    @property
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_date <= now <= self.end_date


class EventProposal(models.Model):
    PROPOSAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=Event.EVENT_TYPE_CHOICES, default='other')
    location = models.CharField(max_length=200)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Event.STATUS_CHOICES, default='upcoming')
    proposal_status = models.CharField(max_length=20, choices=PROPOSAL_STATUS_CHOICES, default='pending')
    admin_comment = models.TextField(blank=True)
    image = models.ImageField(upload_to='event_proposals/', blank=True, null=True)

    proposed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_proposals'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='reviewed_event_proposals',
        null=True,
        blank=True
    )
    target_event = models.ForeignKey(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='edit_proposals'
    )
    created_event = models.OneToOneField(
        'events.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_proposal'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Event Proposal'
        verbose_name_plural = 'Event Proposals'

    def __str__(self):
        return f"{self.title} ({self.get_proposal_status_display()})"

class EventRegistration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['event', 'user']
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
    
    def save(self, *args, **kwargs):
        # Update event participant count
        if not self.pk:  # New registration
            self.event.current_participants += 1
            self.event.save()
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Decrease event participant count
        self.event.current_participants = max(0, self.event.current_participants - 1)
        self.event.save()
        super().delete(*args, **kwargs)


class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='events/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class EventProposalImage(models.Model):
    proposal = models.ForeignKey(EventProposal, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='event_proposals/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
