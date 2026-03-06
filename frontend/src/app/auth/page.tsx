'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams?.get('mode');
  const [isLogin, setIsLogin] = useState(initialMode === 'signup' ? false : true);

  useEffect(() => {
    const mode = searchParams?.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // If already authenticated, redirect to dashboard to avoid seeing auth page after back navigation
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const mode = searchParams?.get('mode');
    if (!token) return;
    // Allow accessing signup even if logged in
    if (mode === 'signup') return;
    const verifyAndRedirect = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          router.replace('/dashboard');
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (_) {
        // noop
      }
    };
    verifyAndRedirect();
  }, [router, searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    phoneNumber: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await fetch('http://localhost:8000/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
              .join(', ');
            throw new Error(fieldErrors || 'Invalid credentials');
          }
          throw new Error(errorData.detail || errorData.message || 'Invalid credentials');
        }
        const data = await res.json();
        if (data.tokens?.access) localStorage.setItem('accessToken', data.tokens.access);
        if (data.tokens?.refresh) localStorage.setItem('refreshToken', data.tokens.refresh);
        router.replace('/dashboard');
        setTimeout(() => { if (window.location.pathname !== '/dashboard') window.location.href = '/dashboard'; }, 100);
      } else {
        const res = await fetch('http://localhost:8000/api/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password_confirm: formData.confirmPassword,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            student_id: formData.studentId || undefined,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
              .join(', ');
            throw new Error(fieldErrors || 'Registration failed');
          }
          throw new Error(errorData.detail || errorData.message || 'Registration failed');
        }
        const data = await res.json();
        if (data.tokens?.access) localStorage.setItem('accessToken', data.tokens.access);
        if (data.tokens?.refresh) localStorage.setItem('refreshToken', data.tokens.refresh);
        router.replace('/dashboard');
        setTimeout(() => { if (window.location.pathname !== '/dashboard') window.location.href = '/dashboard'; }, 100);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#fcde67] flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div
            onClick={() => router.push('/')}
            role="button"
            aria-label="Go to home"
            className="inline-block rounded-full cursor-pointer select-none"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5bccf6] rounded-full mb-3 shadow-xl hover:scale-105 transition-transform">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#030e12]/90 mb-3">Campus Hub</h1>
          <p className="text-[#030e12]/80 text-lg">Your gateway to campus life</p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 border border-[#030e12]/10"
        >
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); router.replace('/auth?mode=login'); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                isLogin
                  ? 'bg-white text-[#030e12] shadow-sm border border-[#5bccf6]'
                  : 'text-gray-600 hover:text-gray-900 border border-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); router.replace('/auth?mode=signup'); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                !isLogin
                  ? 'bg-white text-[#030e12] shadow-sm border border-[#5bccf6]'
                  : 'text-gray-600 hover:text-gray-900 border border-transparent'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your username or email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5bccf6] text-[#030e12] py-3 px-4 rounded-lg font-medium hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#030e12]/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:border-blue-500 transition-all duration-200"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#5bccf6] text-[#030e12] py-3 px-4 rounded-lg font-medium hover:opacity-90 transform hover:scale-105 transition-all duration-200 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Forgot Password Link */}
          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-6"
            >
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#030e12] hover:opacity-80 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
