'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Users, MessageSquare, Plus, BarChart3 } from 'lucide-react';

interface MessFeedback {
  id: number;
  meal_type: string;
  meal_type_display: string;
  meal_subtype: string;
  meal_subtype_custom: string;
  meal_subtype_display: string;
  rating: number;
  rating_display: string;
  comments: string;
  image: string | null;
  image_urls?: string[];
  date: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

interface FeedbackStats {
  meal_type: string;
  meal_type_display: string;
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
  const addFeedbackModalRef = useRef<HTMLDivElement | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    meal_type: 'breakfast',
    meal_subtype: 'tiffins',
    meal_subtype_custom: '',
    rating: 5,
    comments: '',
    images: [] as File[],
  });

  const mealSubtypeOptions: Record<string, { value: string; label: string }[]> = {
    breakfast: [
      { value: 'tiffins', label: 'Tiffins' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'other', label: 'Other' },
    ],
    lunch: [
      { value: 'rice', label: 'Rice' },
      { value: 'roti', label: 'Roti' },
      { value: 'curry', label: 'Curry' },
      { value: 'dal', label: 'Dal' },
      { value: 'other', label: 'Other' },
    ],
    dinner: [
      { value: 'rice', label: 'Rice' },
      { value: 'roti', label: 'Roti' },
      { value: 'curry', label: 'Curry' },
      { value: 'dal', label: 'Dal' },
      { value: 'other', label: 'Other' },
    ],
    snack: [
      { value: 'tea', label: 'Tea' },
      { value: 'coffee', label: 'Coffee' },
      { value: 'fried', label: 'Fried' },
      { value: 'bakery', label: 'Bakery' },
      { value: 'other', label: 'Other' },
    ],
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      requestAnimationFrame(() => {
        addFeedbackModalRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      });
    }
  }, [showAddModal]);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/today_feedbacks/', {
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
        setFeedbacks(normalized as MessFeedback[]);
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
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/stats/?days=0', {
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
        setStats(normalized as FeedbackStats[]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('meal_type', newFeedback.meal_type);
      formData.append('meal_subtype', newFeedback.meal_subtype);
      formData.append('meal_subtype_custom', newFeedback.meal_subtype_custom);
      formData.append('rating', String(newFeedback.rating));
      formData.append('comments', newFeedback.comments);
      if (newFeedback.images.length > 5) {
        alert('You can upload a maximum of 5 images.');
        return;
      }
      newFeedback.images.forEach((file) => formData.append('images', file));
      const response = await fetch('http://localhost:8000/api/mess-feedback/feedbacks/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewFeedback({
          meal_type: 'breakfast',
          meal_subtype: 'tiffins',
          meal_subtype_custom: '',
          rating: 5,
          comments: '',
          images: [],
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
      case 'breakfast':
        return 'bg-orange-100 text-orange-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (url: string) => (
    url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `http://localhost:8000${url}`
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
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
          <h1 className="text-3xl font-bold text-[#030e12]">Mess Feedback</h1>
          <p className="text-[#030e12]/85 mt-2">
            Share your dining experience and help improve our mess services
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Today's Feedback</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Feedback
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.meal_type} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.meal_type_display}
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

      {/* Feedback List */}
      <div className="space-y-4">
        {feedbacks.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-gray-600">
              No feedback submitted for today yet.
            </CardContent>
          </Card>
        )}
        {feedbacks.map((feedback) => {
          const feedbackImages = feedback.image_urls && feedback.image_urls.length > 0
            ? feedback.image_urls
            : feedback.image
              ? [feedback.image]
              : [];
          return (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow overflow-hidden">
            {feedbackImages.length > 0 && (
              <div className="relative">
                <img
                  src={getImageUrl(feedbackImages[0])}
                  alt="Feedback upload"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                {feedbackImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 px-2 py-1 text-xs rounded-full bg-black/70 text-white">
                    +{feedbackImages.length - 1}
                  </span>
                )}
              </div>
            )}
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMealTypeColor(feedback.meal_type)}`}>
                      {feedback.meal_subtype_display
                        ? `${feedback.meal_type_display} - ${feedback.meal_subtype_display}`
                        : feedback.meal_type_display}
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
                  <div className="flex flex-wrap items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {feedback.user.first_name} {feedback.user.last_name}
                    <span className="mx-2">•</span>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Add Feedback Modal */}
      {showAddModal && (
        <div className="form-modal-overlay">
          <div ref={addFeedbackModalRef} className="form-modal-shell sm:max-w-md">
            <h2 className="form-modal-header text-xl font-bold p-4 sm:p-6 pb-3">Add Feedback</h2>
            <form onSubmit={handleAddFeedback} className="flex-1 flex flex-col min-h-0">
              <div className="form-modal-body p-4 sm:p-6 pb-28 sm:pb-24 space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Meal Type</label>
                <select
                  value={newFeedback.meal_type}
                  onChange={(e) => {
                    const nextMealType = e.target.value;
                    const defaultSubtype = mealSubtypeOptions[nextMealType]?.[0]?.value || '';
                    setNewFeedback({
                      ...newFeedback,
                      meal_type: nextMealType,
                      meal_subtype: defaultSubtype,
                      meal_subtype_custom: '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newFeedback.meal_subtype}
                  onChange={(e) => setNewFeedback({...newFeedback, meal_subtype: e.target.value, meal_subtype_custom: ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {(mealSubtypeOptions[newFeedback.meal_type] || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {newFeedback.meal_subtype === 'other' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Specify Other</label>
                  <input
                    type="text"
                    value={newFeedback.meal_subtype_custom}
                    onChange={(e) => setNewFeedback({...newFeedback, meal_subtype_custom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter category (e.g., Poha, Upma, Fruit salad)"
                    required
                  />
                </div>
              )}
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
              <div>
                <label className="block text-sm font-medium mb-1">Images (Optional, max 5)</label>
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
                    setNewFeedback({ ...newFeedback, images: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-xs text-gray-500">{newFeedback.images.length}/5 selected</p>
              </div>
              </div>

              <div className="form-modal-footer p-4 sm:p-6 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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



