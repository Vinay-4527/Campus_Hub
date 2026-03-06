'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Calendar, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventsPreview, setEventsPreview] = useState<any[]>([]);
  const router = useRouter();

  async function fetchEventsPreview() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/events/events/?ordering=start_date', {
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
        setEventsPreview((normalized as any[]).slice(0, 3));
      }
    } catch (_) {}
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.location.href = '/auth?mode=login';
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth?mode=login';
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        window.location.href = '/auth?mode=login';
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchEventsPreview();
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isStudent = user.role === 'student';

  const stats = [
    {
      title: 'Lost Items',
      value: '12',
      change: '+2',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Upcoming Events',
      value: '5',
      change: '+1',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Shared Notes',
      value: '28',
      change: '+5',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Feedback Responses',
      value: '156',
      change: '+12',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // removed duplicate const version; using hoisted function above

  const recentActivities = [
    {
      id: 1,
      type: 'lost_item',
      title: 'Lost laptop reported',
      description: 'A student reported a lost laptop in the library',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'event',
      title: 'New event created',
      description: 'Tech Workshop scheduled for next week',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'note',
      title: 'New note shared',
      description: 'Computer Science notes uploaded',
      time: '6 hours ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'feedback',
      title: 'Mess feedback submitted',
      description: 'Daily feedback for lunch service',
      time: '8 hours ago',
      status: 'completed'
    }
  ];

  // (moved theme apply/useEffect above to keep consistent hooks order)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 sticky top-0 z-10 bg-gray-50 py-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
            Welcome back, {user.first_name} {user.last_name}! Here&apos;s what&apos;s happening on campus.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span className="text-sm text-gray-500">{user.student_id || user.email}</span>
            </div>
          </div>
          
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Events (preview) */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Upcoming Events
            </CardTitle>
            <button
              onClick={() => window.location.href = '/dashboard/events'}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </CardHeader>
          <CardContent>
            {eventsPreview.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming events.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eventsPreview.map((ev: any) => (
                  <div key={ev.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{ev.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ev.description}</p>
                    <div className="mt-3 space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ev.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(ev.start_date).toLocaleTimeString()} - {new Date(ev.end_date).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isStudent && (
                <>
                  <button onClick={() => router.push('/dashboard/lost-found')} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200">
                    Report Lost Item
                  </button>
                  <button onClick={() => router.push('/dashboard/notes')} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-all duration-200">
                    Share Notes
                  </button>
                  <button onClick={() => router.push('/dashboard/mess-feedback')} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transform hover:scale-105 transition-all duration-200">
                    Submit Feedback
                  </button>
                </>
              )}
              {isAdmin && (
                <>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-200">
                    Create Event
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transform hover:scale-105 transition-all duration-200">
                    Manage Users
                  </button>
                  <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transform hover:scale-105 transition-all duration-200">
                    View Analytics
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
