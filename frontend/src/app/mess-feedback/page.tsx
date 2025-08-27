'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star, Plus, Filter, Calendar, Users, TrendingUp } from 'lucide-react';

export default function MessFeedbackPage() {
  const feedbackData = [
    {
      id: 1,
      meal: 'Lunch',
      date: '2024-08-24',
      rating: 4.2,
      totalResponses: 45,
      comments: [
        'Great variety in the menu today!',
        'The pasta was delicious',
        'Could use more vegetarian options'
      ]
    },
    {
      id: 2,
      meal: 'Dinner',
      date: '2024-08-23',
      rating: 3.8,
      totalResponses: 38,
      comments: [
        'The chicken was a bit dry',
        'Good portion sizes',
        'Loved the dessert selection'
      ]
    },
    {
      id: 3,
      meal: 'Breakfast',
      date: '2024-08-23',
      rating: 4.5,
      totalResponses: 52,
      comments: [
        'Fresh fruits were excellent',
        'Omelette station was great',
        'Coffee could be stronger'
      ]
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mess Feedback</h1>
        <p className="text-gray-600">Share your dining experience and help improve campus food services</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.2</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">135</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Your Feedback</h3>
                <p className="text-gray-600 mb-4">Help us improve by sharing your dining experience</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200">
                <Plus className="w-4 h-4" />
                Submit Feedback
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback History */}
      <div className="space-y-6">
        {feedbackData.map((feedback, index) => (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{feedback.meal}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{feedback.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{feedback.totalResponses} responses</span>
                      </div>
                    </div>
                  </div>
                  {renderStars(feedback.rating)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Recent Comments:</h4>
                  {feedback.comments.map((comment, commentIndex) => (
                    <div
                      key={commentIndex}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{comment}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors duration-200">
                    View All Comments
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200">
                    Add Comment
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



