from django.contrib import admin
from .models import Event, EventRegistration, EventProposal


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'status', 'organizer', 'start_date', 'current_participants')
    list_filter = ('event_type', 'status')
    search_fields = ('title', 'description', 'location', 'organizer__username')


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'registered_at', 'attended')
    list_filter = ('attended',)
    search_fields = ('event__title', 'user__username', 'user__email')


@admin.register(EventProposal)
class EventProposalAdmin(admin.ModelAdmin):
    list_display = ('title', 'proposal_status', 'proposed_by', 'reviewed_by', 'created_at', 'reviewed_at')
    list_filter = ('proposal_status', 'event_type', 'status')
    search_fields = ('title', 'description', 'location', 'proposed_by__username')
