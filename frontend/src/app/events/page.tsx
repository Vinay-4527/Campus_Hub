'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  event_type_display: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  status_display: string;
  image: string | null;
  image_urls?: string[];
  organizer: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  participants: Array<{ id: number }>;
  registrations: Array<{
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
  is_full: boolean;
  available_spots: number;
  created_at: string;
  updated_at: string;
}

interface EventProposal {
  id: number;
  title: string;
  description: string;
  event_type: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  image: string | null;
  image_urls?: string[];
  proposal_status: 'pending' | 'approved' | 'rejected';
  proposal_status_display: string;
  admin_comment: string;
  target_event: number | null;
  proposed_by: {
    username: string;
    first_name: string;
    last_name: string;
  };
  created_event: number | null;
  created_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClassRepresentative, setIsClassRepresentative] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTargetEventId, setEditTargetEventId] = useState<number | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<{ id: number; title: string } | null>(null);
  const [createModalContentKey, setCreateModalContentKey] = useState(0);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'other',
    location: '',
    start_date: '',
    end_date: '',
    max_participants: 50,
    images: [] as File[]
  });

  const parseLocalDateTime = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
    if (!match) return NaN;
    const [, year, month, day, hour, minute] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      0,
      0
    ).getTime();
  };

  const isEndAfterStart = (startValue: string, endValue: string) => {
    const startTs = parseLocalDateTime(startValue);
    const endTs = parseLocalDateTime(endValue);
    if (!Number.isFinite(startTs) || !Number.isFinite(endTs)) return true;
    return endTs > startTs;
  };

  const hasInvalidTimeRange =
    Boolean(newEvent.start_date) &&
    Boolean(newEvent.end_date) &&
    !isEndAfterStart(newEvent.start_date, newEvent.end_date);

  const toLocalDateTimeInputValue = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '',
      description: '',
      event_type: 'other',
      location: '',
      start_date: '',
      end_date: '',
      max_participants: 50,
      images: []
    });
    setEditTargetEventId(null);
  };

  useEffect(() => {
    fetchUserRole();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchProposals();
    }
  }, [userRole]);

  useEffect(() => {
    if (showCreateModal) {
      // Ensure the form always opens from top, not previous scroll state.
      requestAnimationFrame(() => {
        const modalBody = document.querySelector<HTMLElement>('#events-create-modal-body');
        if (modalBody) modalBody.scrollTop = 0;
      });
    }
  }, [showCreateModal, createModalContentKey]);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role || null);
        setIsClassRepresentative(Boolean(data.is_class_representative));
        setCurrentUserId(typeof data.id === 'number' ? data.id : null);
      }
    } catch (_) {}
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/events/events/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data
          : (data && Array.isArray((data as any).results) ? (data as any).results : []);
        setEvents(normalized as Event[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (hasInvalidTimeRange) {
        alert('End date and time must be after start date and time.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      const canCreateEvent = userRole && userRole !== 'student';
      const endpoint = canCreateEvent
        ? 'http://localhost:8000/api/events/events/'
        : 'http://localhost:8000/api/events/events/proposals/';
      
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('event_type', newEvent.event_type);
      formData.append('location', newEvent.location);
      formData.append('start_date', newEvent.start_date);
      formData.append('end_date', newEvent.end_date);
      formData.append('max_participants', newEvent.max_participants.toString());
      if (!canCreateEvent && editTargetEventId) {
        formData.append('target_event', String(editTargetEventId));
      }
      if (newEvent.images.length > 5) {
        alert('You can upload a maximum of 5 images.');
        return;
      }
      newEvent.images.forEach((file) => formData.append('images', file));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      if (response.ok) {
        setShowCreateModal(false);
        resetEventForm();
        if (canCreateEvent) {
          fetchEvents();
          alert('Event created successfully');
        } else {
          fetchProposals();
          fetchEvents();
          alert(editTargetEventId ? 'Event edit proposal submitted to admin for review' : 'Event proposal submitted to admin for review');
        }
      } else {
        const errorData = await response.json();
        alert('Submission failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error submitting event form:', error);
      alert('Submission failed');
    }
  };

  const fetchProposals = async () => {
    setProposalLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/events/events/proposals/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProposals(Array.isArray(data) ? data as EventProposal[] : []);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setProposalLoading(false);
    }
  };

  const handleReviewProposal = async (proposalId: number, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('accessToken');
      const adminComment = window.prompt(
        action === 'approve' ? 'Optional approval note:' : 'Reason for rejection (optional):',
        ''
      ) || '';
      const response = await fetch(`http://localhost:8000/api/events/events/proposals/${proposalId}/review/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, admin_comment: adminComment })
      });
      if (response.ok) {
        fetchProposals();
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert('Proposal review failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      alert('Proposal review failed');
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/events/events/${eventId}/register/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        fetchEvents();
        alert('Registered successfully');
      } else {
        const errorData = await response.json();
        alert('Registration failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Registration failed');
    }
  };

  const handleUnregisterEvent = async (eventId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/events/events/${eventId}/unregister/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        fetchEvents();
        alert('Unregistered successfully');
      } else {
        const errorData = await response.json();
        alert('Unregistration failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert('Unregistration failed');
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle?: string) => {
    const firstConfirm = window.confirm(
      `Delete event "${eventTitle || 'this event'}"?`
    );
    if (!firstConfirm) return;
    const secondConfirm = window.confirm('This action is permanent. Are you absolutely sure?');
    if (!secondConfirm) return;
    try {
      setDeletingEventId(eventId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/events/events/${eventId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        fetchEvents();
        setDeleteConfirmEvent(null);
        alert('Event deleted successfully');
      } else {
        const errorData = await response.json();
        alert('Delete failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Delete failed');
    } finally {
      setDeletingEventId(null);
    }
  };

  const openCreateOrProposalModal = () => {
    resetEventForm();
    setCreateModalContentKey((prev) => prev + 1);
    setShowCreateModal(true);
  };

  const openEditProposalModal = (event: Event) => {
    setEditTargetEventId(event.id);
    setNewEvent({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      location: event.location,
      start_date: toLocalDateTimeInputValue(event.start_date),
      end_date: toLocalDateTimeInputValue(event.end_date),
      max_participants: event.max_participants || 50,
      images: [],
    });
    setCreateModalContentKey((prev) => prev + 1);
    setShowCreateModal(true);
  };

  const filteredEvents = (Array.isArray(events) ? events : []).filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const eventTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'academic', label: 'Academic' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' }
  ];

  const eventStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCreateEvent = Boolean(userRole && userRole !== 'student');
  const canProposeEvent = userRole === 'student' && isClassRepresentative;
  const canSubmitEvent = canCreateEvent || canProposeEvent;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-purple-100 text-purple-800';
      case 'cultural': return 'bg-pink-100 text-pink-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="sticky top-0 z-30 py-3 mb-8 bg-white/45 backdrop-blur-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#5bccf6] border border-[#030e12]/15 rounded-xl shadow-sm px-4 py-3 sm:px-5 sm:py-4"
        >
          <h1 className="text-3xl font-bold text-[#030e12]">Events</h1>
          <p className="text-[#030e12]/85 mt-2">
            Discover and participate in campus events, workshops, and activities.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {canSubmitEvent && (
              <button
                onClick={openCreateOrProposalModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                {canCreateEvent ? 'Create Event' : 'Propose Event'}
              </button>
            )}
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Pending Event Proposals</h2>
          {proposalLoading ? (
            <p className="text-sm text-gray-600">Loading proposals...</p>
          ) : (
            <div className="space-y-3">
              {proposals.filter((proposal) => proposal.proposal_status === 'pending').length === 0 && (
                <p className="text-sm text-gray-600">No pending proposals.</p>
              )}
              {proposals
                .filter((proposal) => proposal.proposal_status === 'pending')
                .map((proposal) => (
                  (() => {
                    const proposalImages = proposal.image_urls && proposal.image_urls.length > 0
                      ? proposal.image_urls
                      : proposal.image
                        ? [proposal.image]
                        : [];
                    return (
                  <Card key={proposal.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-0 flex flex-col sm:flex-row">
                      {proposalImages.length > 0 && (
                        <div className="sm:w-80 h-52 sm:h-auto relative">
                          <img 
                            src={proposalImages[0]} 
                            alt={proposal.title}
                            className="w-full h-full object-cover"
                          />
                          {proposalImages.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              +{proposalImages.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{proposal.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(proposal.start_date).toLocaleDateString()}</span>
                              <span className="text-gray-300">|</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{proposal.location}</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getEventTypeColor(proposal.event_type)}`}>
                            {proposal.event_type}
                          </span>
                        </div>
                        {proposal.target_event && (
                          <span className="inline-flex w-fit items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Edit Request
                          </span>
                        )}
                        
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">{proposal.description}</p>
                        
                        <div className="mt-auto pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                            <User className="h-3.5 w-3.5" />
                            <span>Proposed by <span className="font-medium text-gray-700">{proposal.proposed_by.first_name} {proposal.proposed_by.last_name}</span></span>
                          </div>
                          
                          <div className="flex gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleReviewProposal(proposal.id, 'approve')}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewProposal(proposal.id, 'reject')}
                              className="flex-1 sm:flex-none px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    );
                  })()
                ))}
            </div>
          )}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const isExpiredByTime = new Date(event.end_date).getTime() <= Date.now();
          const eventImages = event.image_urls && event.image_urls.length > 0
            ? event.image_urls
            : event.image
              ? [event.image]
              : [];
          const isRegistered = currentUserId
            ? event.registrations?.some((registration) => registration.user?.id === currentUserId) ||
              event.participants?.some((participant) => participant.id === currentUserId)
            : false;

          return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-none bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                {eventImages.length > 0 ? (
                  <img 
                    src={eventImages[0]} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Calendar className="h-10 w-10 mb-2" />
                    <span className="text-sm font-medium">No event image</span>
                  </div>
                )}
                {eventImages.length > 1 && (
                  <span className="absolute left-2 bottom-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {eventImages.length} photos
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getEventTypeColor(event.event_type)}`}>
                    {event.event_type_display}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(event.status)}`}>
                    {event.status_display}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 leading-tight">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-1">
                    {event.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(event.start_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{event.available_spots} spots available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">By {event.organizer.first_name} {event.organizer.last_name}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {canProposeEvent && event.organizer.id === currentUserId && (
                    <button
                      onClick={() => openEditProposalModal(event)}
                      className="w-full sm:w-auto px-3 py-2 border border-amber-300 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-50 transition-all"
                    >
                      Propose Edit
                    </button>
                  )}
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setDeleteConfirmEvent({ id: event.id, title: event.title })}
                      disabled={deletingEventId === event.id}
                      className="w-full sm:w-auto px-3 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  {isExpiredByTime ? (
                    <button className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      Event Expired
                    </button>
                  ) : isRegistered ? (
                    <>
                      <button className="w-full sm:flex-1 px-4 py-2.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center justify-center gap-2 cursor-default">
                        <CheckCircle className="h-4 w-4" />
                        Registered
                      </button>
                      <button
                        onClick={() => handleUnregisterEvent(event.id)}
                        className="w-full sm:flex-1 px-4 py-2.5 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-all"
                      >
                        Unregister
                      </button>
                    </>
                  ) : event.is_full ? (
                    <button className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Event Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterEvent(event.id)}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Register
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>

      {deleteConfirmEvent && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-[75] p-3 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mt-1">
                Delete &quot;{deleteConfirmEvent.title}&quot;?
              </p>
            </div>
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmEvent(null)}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteConfirmEvent.id, deleteConfirmEvent.title)}
                disabled={deletingEventId === deleteConfirmEvent.id}
                className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingEventId === deleteConfirmEvent.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {canSubmitEvent && showCreateModal && (
        <div className="form-modal-overlay z-[70]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-modal-shell sm:max-w-2xl"
          >
            <h3 className="form-modal-header text-lg font-semibold p-4 sm:p-6 pb-3">
              {canCreateEvent ? 'Create New Event' : editTargetEventId ? 'Propose Event Edit' : 'Propose New Event'}
            </h3>
            <form onSubmit={handleCreateEvent} className="flex-1 flex flex-col min-h-0">
              <div id="events-create-modal-body" className="form-modal-body p-4 sm:p-6 pb-28 sm:pb-24 space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add event details (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {eventTypes.slice(1).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <div className="space-y-2">
                    <input
                      type="datetime-local"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                      className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <div className="space-y-2">
                    <input
                      type="datetime-local"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                      min={newEvent.start_date || undefined}
                      className={`w-full min-w-0 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        hasInvalidTimeRange ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {hasInvalidTimeRange && (
                      <p className="text-xs text-red-600">End date and time must be after start date and time.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={newEvent.max_participants}
                  onChange={(e) => setNewEvent({...newEvent, max_participants: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Images (optional, max 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 5) {
                      alert('You can upload a maximum of 5 images.');
                      return;
                    }
                    setNewEvent({ ...newEvent, images: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newEvent.images.length}/5 selected
                </p>
              </div>
              
              </div>

              <div className="form-modal-footer p-4 sm:p-6 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={hasInvalidTimeRange}
                  className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {canCreateEvent ? 'Create Event' : editTargetEventId ? 'Submit Edit Proposal' : 'Submit Proposal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetEventForm();
                  }}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}



