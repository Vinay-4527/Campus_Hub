'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Plus, Filter } from 'lucide-react';

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: 'Tech Workshop: Introduction to AI',
      description: 'Learn the basics of artificial intelligence and machine learning in this hands-on workshop.',
      date: '2024-09-15',
      time: '14:00 - 16:00',
      location: 'Computer Science Building - Room 101',
      attendees: 45,
      maxAttendees: 50,
      category: 'Workshop',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Campus Cultural Festival',
      description: 'Annual cultural festival celebrating diversity with food, music, and performances.',
      date: '2024-09-20',
      time: '18:00 - 22:00',
      location: 'Main Campus Grounds',
      attendees: 120,
      maxAttendees: 200,
      category: 'Festival',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Career Fair 2024',
      description: 'Connect with top employers and explore career opportunities in various industries.',
      date: '2024-09-25',
      time: '10:00 - 16:00',
      location: 'Student Center - Grand Hall',
      attendees: 89,
      maxAttendees: 150,
      category: 'Career',
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
        <p className="text-gray-600">Discover and join exciting campus events</p>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Event Image</p>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{event.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees}/{event.maxAttendees} attendees</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200">
                      Register
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200">
                      Details
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



