'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Filter, MapPin, Clock, User, Tag, Eye, MessageSquare, Copy, Trash2 } from 'lucide-react';

interface LostFoundItem {
  id: number;
  item_name: string;
  description: string;
  category: string;
  location: string;
  status: string;
  primary_phone: string;
  secondary_phone: string;
  image: string | null;
  image_urls?: string[];
  reported_by: {
    first_name: string;
    last_name: string;
    id?: number;
    email?: string;
    phone_number?: string;
  };
  created_at: string;
}

export default function LostFoundPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item_name: '',
    description: '',
    category: 'other',
    location: '',
    primary_phone: '',
    secondary_phone: '',
    images: [] as File[]
  });
  const [phoneErrors, setPhoneErrors] = useState({
    primary_phone: '',
    secondary_phone: ''
  });
  const [contactModalItem, setContactModalItem] = useState<LostFoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [claimForm, setClaimForm] = useState({
    details: '',
    contact: '',
    proofFile: null as File | null,
  });
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; role?: string } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; title: string } | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCurrentUser();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/lost-found/items/', {
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
        setItems(normalized as LostFoundItem[]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ id: data.id, email: data.email, role: data.role });
      }
    } catch (_) {}
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const primaryError = getPhoneValidationError(newItem.primary_phone, true);
    const secondaryError = getPhoneValidationError(newItem.secondary_phone, false);
    setPhoneErrors({
      primary_phone: primaryError,
      secondary_phone: secondaryError
    });
    if (primaryError || secondaryError) {
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('item_name', newItem.item_name);
      formData.append('description', newItem.description);
      formData.append('category', newItem.category);
      formData.append('location', newItem.location);
      formData.append('primary_phone', newItem.primary_phone);
      formData.append('secondary_phone', newItem.secondary_phone);
      if (newItem.images.length > 5) {
        alert('You can upload a maximum of 5 images.');
        return;
      }
      newItem.images.forEach((file) => formData.append('images', file));
      const response = await fetch('http://localhost:8000/api/lost-found/items/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewItem({
          item_name: '',
          description: '',
          category: 'other',
          location: '',
          primary_phone: '',
          secondary_phone: '',
          images: []
        });
        setPhoneErrors({ primary_phone: '', secondary_phone: '' });
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleClaimItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/lost-found/items/${itemId}/claim_item/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          details: claimForm.details,
          contact: claimForm.contact,
        })
      });
      
      if (response.ok) {
        fetchItems();
        setClaimModalItem(null);
        setClaimForm({ details: '', contact: currentUser?.email || '', proofFile: null });
      }
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const handleMarkFound = async (itemId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/lost-found/items/${itemId}/mark_found/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchItems();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Could not mark item as found.');
      }
    } catch (error) {
      console.error('Error marking item as found:', error);
    }
  };

  const handleDeleteItem = async (itemId: number, title: string) => {
    const firstConfirm = window.confirm(`Delete item "${title}"?`);
    if (!firstConfirm) return;
    const secondConfirm = window.confirm('This action is permanent. Are you absolutely sure?');
    if (!secondConfirm) return;
    try {
      setDeletingItemId(itemId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/lost-found/items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok || response.status === 204) {
        fetchItems();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || 'Failed to delete item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const openContactModal = (item: LostFoundItem) => {
    setContactModalItem(item);
  };

  const closeContactModal = () => {
    setContactModalItem(null);
  };

  const copyContactInfoToClipboard = async (contactInfo: string) => {
    try {
      await navigator.clipboard.writeText(contactInfo);
      alert('Contact info copied to clipboard');
    } catch (error) {
      console.error('Failed to copy contact info:', error);
    }
  };

  const getPhoneValidationError = (value: string, isRequired: boolean): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return isRequired ? 'Primary phone number is required.' : '';
    }

    if (/[^0-9+\s\-()]/.test(trimmed)) {
      return 'Invalid character. Use digits, spaces, +, -, and parentheses only.';
    }

    const plusCount = (trimmed.match(/\+/g) || []).length;
    if (plusCount > 1 || (plusCount === 1 && !trimmed.startsWith('+'))) {
      return 'The + sign is allowed only at the beginning.';
    }

    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return 'Phone number must be at least 10 digits.';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number must not exceed 15 digits.';
    }

    return '';
  };

  const handlePhoneInputChange = (field: 'primary_phone' | 'secondary_phone', value: string) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
    setPhoneErrors((prev) => ({
      ...prev,
      [field]: getPhoneValidationError(value, field === 'primary_phone')
    }));
  };

  const isCollegeEmail = (email: string | undefined | null): boolean => {
    if (!email) return false;
    const domain = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN || 'edu';
    return email.toLowerCase().endsWith(domain.toLowerCase());
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all'
      ? item.status !== 'returned'
      : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lost': return 'bg-red-100 text-red-800';
      case 'found': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="sticky top-0 z-30 py-3 mb-6 sm:mb-8 bg-white/45 backdrop-blur-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#5bccf6] border border-[#030e12]/15 rounded-xl shadow-sm px-4 py-3 sm:px-5 sm:py-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#030e12]">Lost & Found</h1>
          <p className="text-sm sm:text-base text-[#030e12]/85 mt-2">
            Report lost items or help others find their belongings
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="claimed">Claimed</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto justify-center flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredItems.map((item) => {
          const itemImages = item.image_urls && item.image_urls.length > 0
            ? item.image_urls
            : item.image
              ? [item.image]
              : [];
          return (
          <Card key={item.id} className="hover:shadow-md transition-all duration-200 border border-slate-200 rounded-2xl bg-white">
            {itemImages.length > 0 && (
              <div className="relative">
                <img
                  src={itemImages[0]}
                  alt={item.item_name}
                  className="w-full h-72 sm:h-80 object-cover rounded-t-2xl"
                />
                <button
                  type="button"
                  onClick={() => setFullscreenImage({ src: itemImages[0], title: item.item_name })}
                  className="absolute top-3 right-3 p-2 text-xs bg-black/70 text-white rounded-lg hover:bg-black/80"
                  title="View fullscreen"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {itemImages.length > 1 && (
                  <span className="absolute bottom-3 right-3 px-2 py-1 text-xs rounded-full bg-black/70 text-white">
                    +{itemImages.length - 1}
                  </span>
                )}
                <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900 line-clamp-1">{item.item_name}</CardTitle>
                {itemImages.length === 0 && (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-2">{item.description || 'No description provided.'}</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {item.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {item.reported_by.first_name} {item.reported_by.last_name}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                {item.status === 'found' && (
                  currentUser && item.reported_by?.id === currentUser.id ? (
                    <span className="w-full sm:flex-1 px-4 py-2.5 bg-yellow-100 text-yellow-800 rounded-xl text-center font-medium">
                      Posted by You
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setClaimModalItem(item);
                        setClaimForm({ details: '', contact: currentUser?.email || '', proofFile: null });
                      }}
                      className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium"
                    >
                      Claim This Item
                    </button>
                  )
                )}
                {item.status === 'lost' && (
                  <>
                    <button
                      onClick={() => openContactModal(item)}
                      className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                    >
                      Contact Owner
                    </button>
                    {currentUser && item.reported_by?.id === currentUser.id && (
                      <button
                        onClick={() => handleMarkFound(item.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
                      >
                        Found
                      </button>
                    )}
                  </>
                )}
                {item.status === 'claimed' && (
                  <button className="w-full sm:flex-1 px-4 py-2.5 bg-gray-400 text-white rounded-xl cursor-not-allowed font-medium">
                    Already Claimed
                  </button>
                )}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteItem(item.id, item.item_name)}
                    disabled={deletingItemId === item.id}
                    className="w-full sm:w-auto px-4 py-2.5 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="form-modal-overlay">
          <div className="form-modal-shell sm:max-w-md">
            <h2 className="form-modal-header text-xl font-bold p-4 sm:p-6 pb-3">Report Item</h2>
            <form onSubmit={handleAddItem} className="flex-1 flex flex-col min-h-0">
              <div className="form-modal-body p-4 sm:p-6 pb-28 sm:pb-24 space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({...newItem, item_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Optional details about the item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="electronics">Electronics</option>
                  <option value="books">Books</option>
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="documents">Documents</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Phone Number</label>
                <input
                  type="tel"
                  value={newItem.primary_phone}
                  onChange={(e) => handlePhoneInputChange('primary_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${phoneErrors.primary_phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Required"
                  pattern="^\+?[0-9\s\-()]{10,20}$"
                  title="Enter a valid phone number (10-15 digits, optional +, spaces, dashes, parentheses)."
                  required
                />
                {phoneErrors.primary_phone && (
                  <p className="mt-1 text-xs text-red-600">{phoneErrors.primary_phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Phone Number (optional)</label>
                <input
                  type="tel"
                  value={newItem.secondary_phone}
                  onChange={(e) => handlePhoneInputChange('secondary_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${phoneErrors.secondary_phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Optional"
                  pattern="^\+?[0-9\s\-()]{10,20}$"
                  title="Enter a valid phone number (10-15 digits, optional +, spaces, dashes, parentheses)."
                />
                {phoneErrors.secondary_phone && (
                  <p className="mt-1 text-xs text-red-600">{phoneErrors.secondary_phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images (optional, max 5)</label>
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
                    setNewItem({ ...newItem, images: files });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="mt-1 text-xs text-gray-500">{newItem.images.length}/5 selected</p>
              </div>
              </div>

              <div className="form-modal-footer p-4 sm:p-6 pb-[max(env(safe-area-inset-bottom),1rem)] flex gap-2">
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
                  Report Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Owner Modal */}
      {contactModalItem && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-4 sm:my-0 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Contact Owner</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Item</p>
                <p className="font-medium text-gray-900">{contactModalItem.item_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{contactModalItem.reported_by.first_name} {contactModalItem.reported_by.last_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Primary Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 break-all">{contactModalItem.primary_phone || 'Not provided'}</p>
                  {contactModalItem.primary_phone && (
                    <button
                      onClick={() => copyContactInfoToClipboard(contactModalItem.primary_phone)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Secondary Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 break-all">{contactModalItem.secondary_phone || 'Not provided'}</p>
                  {contactModalItem.secondary_phone && (
                    <button
                      onClick={() => copyContactInfoToClipboard(contactModalItem.secondary_phone)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={closeContactModal}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Close
              </button>
              {contactModalItem.primary_phone && (
                <a
                  href={`tel:${contactModalItem.primary_phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full sm:flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg"
                >
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Request Modal */}
      {claimModalItem && (
        <div className="form-modal-overlay">
          <div className="form-modal-shell sm:max-w-md">
            <h2 className="form-modal-header text-xl font-bold p-4 sm:p-6 pb-3">Claim This Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleClaimItem(claimModalItem.id);
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="form-modal-body p-4 sm:p-6 pb-28 sm:pb-24 space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Describe identifying details</label>
                <textarea
                  value={claimForm.details}
                  onChange={(e) => setClaimForm({ ...claimForm, details: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your contact (college email preferred)</label>
                <input
                  type="email"
                  value={claimForm.contact}
                  onChange={(e) => setClaimForm({ ...claimForm, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {claimForm.contact && !isCollegeEmail(claimForm.contact) && (
                  <p className="text-xs text-yellow-600 mt-1">Tip: use your college email for faster approval.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proof (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setClaimForm({ ...claimForm, proofFile: e.target.files?.[0] || null })}
                  className="w-full"
                  accept="image/*,application/pdf"
                />
              </div>
              </div>
              <div className="form-modal-footer p-4 sm:p-6 pb-[max(env(safe-area-inset-bottom),1rem)] flex flex-col sm:flex-row gap-2">
                <button type="button" onClick={() => setClaimModalItem(null)} className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20"
          >
            Close
          </button>
          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={fullscreenImage.src}
              alt={fullscreenImage.title}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-lg"
            />
            <p className="mt-3 text-sm text-gray-200">{fullscreenImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
