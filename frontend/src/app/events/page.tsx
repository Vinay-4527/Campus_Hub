'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  organizer: {
    username: string;
    first_name: string;
    last_name: string;
  };
  participants: any[];
  registrations: any[];
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
  proposal_status: 'pending' | 'approved' | 'rejected';
  proposal_status_display: string;
  admin_comment: string;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'other',
    location: '',
    start_date: '',
    end_date: '',
    max_participants: 50
  });

  useEffect(() => {
    fetchUserRole();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchProposals();
    }
  }, [userRole]);

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
      const token = localStorage.getItem('accessToken');
      const canCreateEvent = userRole && userRole !== 'student';
      const endpoint = canCreateEvent
        ? 'http://localhost:8000/api/events/events/'
        : 'http://localhost:8000/api/events/events/proposals/';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewEvent({
          title: '',
          description: '',
          event_type: 'other',
          location: '',
          start_date: '',
          end_date: '',
          max_participants: 50
        });
        if (canCreateEvent) {
          fetchEvents();
          alert('Event created successfully');
        } else {
          fetchProposals();
          alert('Event proposal submitted to admin for review');
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
      } else {
        const errorData = await response.json();
        alert('Unregistration failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert('Unregistration failed');
    }
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
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and participate in campus events, workshops, and activities.
          </p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
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
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {eventStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {canSubmitEvent && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {canCreateEvent ? 'Create Event' : 'Propose Event'}
            </button>
          )}
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
                  <Card key={proposal.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{proposal.title}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(proposal.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{proposal.description}</p>
                        <p className="text-xs text-gray-500">
                          Proposed by {proposal.proposed_by.first_name} {proposal.proposed_by.last_name} ({proposal.proposed_by.username})
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleReviewProposal(proposal.id, 'approve')}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewProposal(proposal.id, 'reject')}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type_display}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status_display}
                      </span>
                    </div>
                  </div>
                  <Calendar className="h-6 w-6 text-gray-400 flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(event.start_date).toLocaleTimeString()} - {new Date(event.end_date).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.available_spots} spots available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Organized by {event.organizer.first_name} {event.organizer.last_name}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {event.is_full ? (
                    <button className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded-md cursor-not-allowed">
                      Event Full
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterEvent(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Register
                    </button>
                  )}
                  <button className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create Event Modal */}
      {canSubmitEvent && showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-4">
              {canCreateEvent ? 'Create New Event' : 'Propose New Event'}
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
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
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {canCreateEvent ? 'Create Event' : 'Submit Proposal'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
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



