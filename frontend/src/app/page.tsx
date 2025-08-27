'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Calendar, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ArrowDown,
  MapPin,
  Clock,
  Users,
  Star,
  Tag,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  // Header should not move on scroll; no scroll-based transforms

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Sample data for preview
  const lostItems = [
    {
      id: 1,
      title: 'MacBook Pro Laptop',
      description: 'Silver MacBook Pro with university sticker',
      location: 'Library - 2nd Floor',
      date: '2 hours ago',
      status: 'lost'
    },
    {
      id: 2,
      title: 'Student ID Card',
      description: 'Student ID for John Smith, Computer Science',
      location: 'Cafeteria',
      date: '1 day ago',
      status: 'found'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Tech Workshop: Introduction to AI',
      description: 'Learn the basics of artificial intelligence',
      date: 'Sep 15, 2024',
      time: '14:00 - 16:00',
      location: 'Computer Science Building',
      attendees: 45,
      maxAttendees: 50
    },
    {
      id: 2,
      title: 'Campus Cultural Festival',
      description: 'Annual cultural festival celebrating diversity',
      date: 'Sep 20, 2024',
      time: '18:00 - 22:00',
      location: 'Main Campus Grounds',
      attendees: 120,
      maxAttendees: 200
    }
  ];

  const notes = [
    {
      id: 1,
      title: 'Introduction to Computer Science',
      description: 'Comprehensive notes covering fundamentals',
      subject: 'Computer Science',
      author: 'Dr. Sarah Johnson',
      downloads: 156
    },
    {
      id: 2,
      title: 'Advanced Mathematics - Calculus II',
      description: 'Detailed notes on integration techniques',
      subject: 'Mathematics',
      author: 'Prof. Michael Chen',
      downloads: 89
    }
  ];

  const feedback = [
    {
      id: 1,
      meal: 'Lunch',
      date: 'Today',
      rating: 4.2,
      comments: ['Great variety in the menu today!', 'The pasta was delicious']
    },
    {
      id: 2,
      meal: 'Dinner',
      date: 'Yesterday',
      rating: 3.8,
      comments: ['Good portion sizes', 'Loved the dessert selection']
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-[#fcde67]">
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-50 w-full bg-[#fcde67]/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#5bccf6] rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#030e12]">Campus Hub</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth?mode=login"
                className="px-6 py-2 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
              >
                Log In
              </Link>
              <Link
                href="/auth?mode=signup"
                className="px-6 py-2 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pt-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        >
          {/* Minimal background */}
          <div className="absolute inset-0" />
          
          <div className="text-center max-w-5xl mx-auto relative z-10">
                          <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center justify-center w-32 h-32 bg-[#5bccf6] rounded-full mb-10 shadow-2xl"
              >
                <GraduationCap className="w-16 h-16 text-white" />
              </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-6xl font-bold text-[#030e12] mb-8"
            >
              Welcome to <span className="text-[#030e12]">Campus Hub</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-[#030e12]/80 mb-16 max-w-4xl mx-auto leading-relaxed"
            >
              Your one-stop platform for all campus utilities. Connect, share, and make campus life easier.
            </motion.p>
            
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              onClick={scrollToFeatures}
              className="inline-flex items-center px-10 py-4 bg-[#5bccf6] text-[#030e12] font-bold text-lg rounded-2xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow"
            >
              Explore Campus Hub
              <ArrowDown className="ml-3 h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features-section" className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-[#030e12] mb-6">
              Explore Campus Hub Features
            </h2>
            <p className="text-lg text-[#030e12]/80 max-w-4xl mx-auto leading-relaxed">
              Discover how Campus Hub connects students, faculty, and staff. 
              Browse through our features and see what's happening on campus.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Lost & Found */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
                          <Card className="h-full flex flex-col bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 font-bold text-xl">
                  <div className="p-3 bg-[#5bccf6]/20 rounded-xl">
                    <Search className="w-6 h-6 text-[#030e12]" />
                  </div>
                  Lost & Found
                </CardTitle>
                <p className="text-[#030e12]/80 leading-relaxed text-base">
                  Help others find their belongings or report your lost items
                </p>
              </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4">
                    {lostItems.map((item) => (
                      <div key={item.id} className="p-4 border border-[#030e12]/10 rounded-xl bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                            <p className="text-[#030e12]/80">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-[#030e12]/60">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {item.date}
                              </span>
                            </div>
                          </div>
                                                     <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                             item.status === 'lost' 
                               ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                               : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                           }`}>
                             {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                           </span>
                        </div>
                      </div>
                    ))}
                                         <div className="text-center pt-6 mt-auto">
                       <p className="text-gray-600 mb-4">
                         Join Campus Hub to report lost items or contact owners
                       </p>
                       <Link
                         href="/auth?mode=signup"
                         className="inline-flex items-center px-6 py-3 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
                       >
                         Sign Up to Participate
                         <ArrowRight className="ml-2 w-4 h-4" />
                       </Link>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Events */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
                          <Card className="h-full flex flex-col bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-gray-900 font-bold text-xl">
                  <div className="p-3 bg-[#5bccf6]/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-[#030e12]" />
                  </div>
                  Events
                </CardTitle>
                <p className="text-gray-600 leading-relaxed text-base">
                  Discover and join exciting campus events
                </p>
              </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 rounded-xl bg-white">
                        <h4 className="font-bold text-gray-900 text-lg">{event.title}</h4>
                        <p className="text-gray-600">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2 mt-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Capacity</span>
                          </div>
                          <span className="font-medium">{event.attendees}/{event.maxAttendees}</span>
                        </div>
                        <div className="w-full bg-[#030e12]/10 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-[#5bccf6] h-3 rounded-full transition-all duration-500 shadow"
                            style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-6 mt-auto">
                      <p className="text-gray-600 mb-4">
                        Join Campus Hub to register for events or create your own
                      </p>
                      <Link
                        href="/auth?mode=signup"
                        className="inline-flex items-center px-6 py-3 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
                      >
                        Sign Up to Participate
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 font-bold text-xl">
                    <div className="p-3 bg-[#5bccf6]/20 rounded-xl">
                      <FileText className="w-6 h-6 text-[#030e12]" />
                    </div>
                    Notes Sharing
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Access and share study materials with fellow students
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 rounded-xl bg-white">
                        <h4 className="font-bold text-gray-900 text-lg">{note.title}</h4>
                        <p className="text-gray-600">{note.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {note.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {note.downloads} downloads
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-6 mt-auto">
                      <p className="text-gray-600 mb-4">
                        Join Campus Hub to upload and download study materials
                      </p>
                      <Link
                        href="/auth?mode=signup"
                        className="inline-flex items-center px-6 py-3 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
                      >
                        Sign Up to Participate
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mess Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="h-full flex flex-col bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-gray-900 font-bold text-xl">
                    <div className="p-3 bg-[#5bccf6]/20 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-[#030e12]" />
                    </div>
                    Mess Feedback
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Share your dining experience and help improve campus food services
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4">
                    {feedback.map((item) => (
                      <div key={item.id} className="p-4 border border-white/20 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{item.meal}</h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= item.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-500">({item.rating})</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{item.date}</p>
                        <div className="mt-2 space-y-1">
                          {item.comments.map((comment, index) => (
                            <p key={index} className="text-xs text-gray-500">• {comment}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-6 mt-auto">
                      <p className="text-gray-600 mb-4">
                        Join Campus Hub to submit feedback and see dining ratings
                      </p>
                      <Link
                        href="/auth?mode=signup"
                        className="inline-flex items-center px-6 py-3 bg-[#5bccf6] text-[#030e12] rounded-xl hover:opacity-90 transition-all duration-300 font-medium shadow"
                      >
                        Sign Up to Participate
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="text-5xl font-bold text-cyan-400 mb-3">500+</div>
                <div className="text-gray-600 font-medium text-base">Active Students</div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="text-5xl font-bold text-pink-400 mb-3">50+</div>
                <div className="text-gray-600 font-medium text-base">Events Created</div>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="text-5xl font-bold text-yellow-400 mb-3">1000+</div>
                <div className="text-gray-600 font-medium text-base">Items Found</div>
              </motion.div>
        </div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-[#030e12] text-white border-0 shadow-2xl max-w-4xl mx-auto">
              <CardContent className="p-12">
                <h3 className="text-4xl font-bold mb-6">
                  Ready to Join the Campus Community?
                </h3>
                <p className="text-xl mb-10 opacity-90 leading-relaxed">
                  Connect with fellow students, share resources, and make the most of your campus experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth?mode=signup"
                    className="px-10 py-4 bg-[#5bccf6] text-[#030e12] font-bold text-lg rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/auth?mode=login"
                    className="px-10 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-[#030e12] transition-all duration-300 transform hover:scale-105"
                  >
                    Log In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
