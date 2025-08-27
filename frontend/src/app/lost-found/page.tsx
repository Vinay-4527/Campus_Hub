'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Filter, MapPin, Clock, Tag } from 'lucide-react';
import LoginPrompt from '@/components/auth/LoginPrompt';

export default function LostFoundPage() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const lostItems = [
    {
      id: 1,
      title: 'MacBook Pro Laptop',
      description: 'Silver MacBook Pro with university sticker on the back',
      location: 'Library - 2nd Floor',
      date: '2024-08-24',
      status: 'lost',
      category: 'Electronics',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Student ID Card',
      description: 'Student ID for John Smith, Computer Science Department',
      location: 'Cafeteria',
      date: '2024-08-23',
      status: 'found',
      category: 'Documents',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: 'Water Bottle',
      description: 'Blue Hydro Flask water bottle with university logo',
      location: 'Gym',
      date: '2024-08-22',
      status: 'found',
      category: 'Personal Items',
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lost & Found</h1>
        <p className="text-gray-600">Help others find their belongings or report your lost items</p>
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button 
                  onClick={() => setShowLoginPrompt(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Report Item
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lostItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Item Image</p>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'lost' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>{item.category}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setShowLoginPrompt(true)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    {item.status === 'lost' ? 'Claim Item' : 'Contact Owner'}
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200">
                    Details
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature="Lost & Found"
        benefits={[
          "Report lost or found items",
          "Contact item owners directly",
          "Get notifications when items are found",
          "Track your reported items",
          "Help other students find their belongings"
        ]}
      />
    </div>
  );
}
