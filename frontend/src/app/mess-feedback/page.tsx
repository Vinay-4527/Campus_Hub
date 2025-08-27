'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Users, MessageSquare, Plus, BarChart3 } from 'lucide-react';

interface MessFeedback {
  id: number;
  meal_type: string;
  rating: number;
  rating_display: string;
  comments: string;
  date: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

interface FeedbackStats {
  meal_type: string;
  average_rating: number;
  total_feedbacks: number;
  positive_feedbacks: number;
  negative_feedbacks: number;
}

export default function MessFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    meal_type: 'lunch',
    rating: 5,
    comments: ''
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/stats/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFeedback)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewFeedback({
          meal_type: 'lunch',
          rating: 5,
          comments: ''
        });
        fetchFeedbacks();
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-orange-100 text-orange-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Mess Feedback</h1>
          <p className="text-gray-600 mt-2">
            Share your dining experience and help improve our mess services
          </p>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.meal_type} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.meal_type.charAt(0).toUpperCase() + stat.meal_type.slice(1)}
              </CardTitle>
              <div className={`p-2 rounded-lg ${getMealTypeColor(stat.meal_type)}`}>
                <BarChart3 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.average_rating.toFixed(1)}</div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.total_feedbacks} feedbacks • {stat.positive_feedbacks} positive
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feedback
        </button>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(feedback.meal_type)}`}>
                      {feedback.meal_type.charAt(0).toUpperCase() + feedback.meal_type.slice(1)}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= feedback.rating ? getRatingColor(feedback.rating) : 'text-gray-300'
                          }`}
                          fill={star <= feedback.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span className={`ml-2 text-sm font-medium ${getRatingColor(feedback.rating)}`}>
                        {feedback.rating_display}
                      </span>
                    </div>
                  </div>
                  {feedback.comments && (
                    <p className="text-gray-700 mb-2">{feedback.comments}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {feedback.user.first_name} {feedback.user.last_name}
                    <span className="mx-2">•</span>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Feedback Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Feedback</h2>
            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meal Type</label>
                <select
                  value={newFeedback.meal_type}
                  onChange={(e) => setNewFeedback({...newFeedback, meal_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback({...newFeedback, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newFeedback.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                        fill={star <= newFeedback.rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {newFeedback.rating}/5
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comments (Optional)</label>
                <textarea
                  value={newFeedback.comments}
                  onChange={(e) => setNewFeedback({...newFeedback, comments: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



