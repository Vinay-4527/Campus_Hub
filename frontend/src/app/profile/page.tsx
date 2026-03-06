'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Eye, 
  EyeOff,
  Activity,
  FileText,
  Calendar as CalendarIcon,
  MessageSquare,
  Search,
  Download,
  Settings
} from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  student_id: string;
  phone_number: string;
  profile_picture: string | null;
  date_joined: string;
  last_login: string;
}

interface UserActivity {
  type: string;
  title: string;
  description: string;
  date: string;
  count: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    student_id: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [userActivity] = useState<UserActivity[]>([
    {
      type: 'lost_found',
      title: 'Lost & Found Items',
      description: 'Items you have reported or claimed',
      date: '2024-01-15',
      count: 5
    },
    {
      type: 'events',
      title: 'Events Participated',
      description: 'Events you have registered for',
      date: '2024-01-10',
      count: 3
    },
    {
      type: 'notes',
      title: 'Notes Shared',
      description: 'Notes you have uploaded',
      date: '2024-01-08',
      count: 8
    },
    {
      type: 'feedback',
      title: 'Mess Feedback',
      description: 'Feedback you have submitted',
      date: '2024-01-05',
      count: 12
    }
  ]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
        setEditForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          student_id: userData.student_id || ''
        });
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

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert('Update failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Update failed');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        alert('Password changed successfully!');
      } else {
        const errorData = await response.json();
        alert('Password change failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Password change failed');
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          first_name: user.first_name || '',
                          last_name: user.last_name || '',
                          email: user.email || '',
                          phone_number: user.phone_number || '',
                          student_id: user.student_id || ''
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.last_name || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.student_id}
                        onChange={(e) => setEditForm({...editForm, student_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.student_id || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={editForm.phone_number}
                        onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">{new Date(user.date_joined).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {userActivity.map((activity) => (
                  <div key={activity.type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{activity.count}</div>
                    <div className="text-sm text-gray-600 mt-1">{activity.title}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-900">
                    {new Date(user.last_login).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Username</span>
                  <span className="text-sm text-gray-900">{user.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordForm.old_password}
                    onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
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
