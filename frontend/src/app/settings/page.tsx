'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Palette, Globe, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => (typeof window !== 'undefined' ? ((localStorage.getItem('theme') as any) || 'system') : 'system'));
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState('');

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch (_) {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      router.replace('/auth?mode=login');
      setTimeout(() => { if (typeof window !== 'undefined' && window.location.pathname !== '/auth') window.location.href = '/auth?mode=login'; }, 100);
      setIsLoggingOut(false);
    }
  };

  const applyTheme = (next: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = next === 'dark' || (next === 'system' && prefersDark);
    root.classList.toggle('dark', shouldDark);
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    if (typeof window !== 'undefined') localStorage.setItem('theme', value);
    applyTheme(value);
  };

  // apply current theme on mount
  if (typeof window !== 'undefined') {
    applyTheme(theme);
  }

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match');
      return;
    }
    try {
      setChanging(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(data.detail) ? data.detail.join(', ') : (data.detail || 'Change password failed'));
      }
      alert('Password changed. Please log in again.');
      setShowChangePassword(false);
      // Force logout as backend logs out session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.replace('/auth?mode=login');
      }
    } catch (err) {
      setChangeError((err as Error).message);
    } finally {
      setChanging(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-xs text-gray-500 mb-2">Email cannot be changed by users. Contact an administrator to update.</p>
                <input
                  type="email"
                  defaultValue="john.doe@university.edu"
                  disabled
                  readOnly
                  title="Email changes are restricted to admins"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  defaultValue="STU001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Update Profile
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Event Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded about upcoming events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button onClick={() => setShowChangePassword(true)} className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
                Change Password
              </button>

              {showChangePassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    {changeError && <p className="mb-3 text-sm text-red-600">{changeError}</p>}
                    <form onSubmit={submitPasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <button type="button" onClick={() => setShowChangePassword(false)} className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
                        <button type="submit" disabled={changing} className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">{changing ? 'Saving...' : 'Update Password'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings removed as requested */}
      </div>

      {/* Logout Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8"
      >
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
                <p className="text-sm text-gray-600">Irreversible and destructive actions</p>
              </div>
              <button onClick={handleLogout} disabled={isLoggingOut} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}



