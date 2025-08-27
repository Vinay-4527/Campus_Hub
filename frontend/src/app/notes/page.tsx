'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Share2, Plus, Search, Filter, User, Calendar } from 'lucide-react';

export default function NotesPage() {
  const notes = [
    {
      id: 1,
      title: 'Introduction to Computer Science',
      description: 'Comprehensive notes covering the fundamentals of computer science including algorithms, data structures, and programming concepts.',
      subject: 'Computer Science',
      author: 'Dr. Sarah Johnson',
      date: '2024-08-20',
      downloads: 156,
      fileSize: '2.4 MB',
      fileType: 'PDF'
    },
    {
      id: 2,
      title: 'Advanced Mathematics - Calculus II',
      description: 'Detailed notes on integration techniques, applications of integrals, and series convergence.',
      subject: 'Mathematics',
      author: 'Prof. Michael Chen',
      date: '2024-08-18',
      downloads: 89,
      fileSize: '1.8 MB',
      fileType: 'PDF'
    },
    {
      id: 3,
      title: 'Business Ethics and Corporate Social Responsibility',
      description: 'Case studies and theoretical frameworks for understanding ethical decision-making in business.',
      subject: 'Business',
      author: 'Dr. Emily Rodriguez',
      date: '2024-08-15',
      downloads: 203,
      fileSize: '3.1 MB',
      fileType: 'PDF'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes Sharing</h1>
        <p className="text-gray-600">Access and share study materials with fellow students</p>
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
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                  <Plus className="w-4 h-4" />
                  Upload Notes
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Document Preview</p>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {note.fileType}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{note.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{note.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{note.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{note.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>{note.downloads} downloads • {note.fileSize}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}



