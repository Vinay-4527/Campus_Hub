'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Filter, MapPin, Clock, User, Tag, Eye, MessageSquare, Copy } from 'lucide-react';

interface LostFoundItem {
  id: number;
  item_name: string;
  description: string;
  category: string;
  location: string;
  status: string;
  contact_info: string;
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
    status: 'lost',
    contact_info: ''
  });
  const [contactModalItem, setContactModalItem] = useState<LostFoundItem | null>(null);
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [claimForm, setClaimForm] = useState({
    details: '',
    contact: '',
    proofFile: null as File | null,
  });
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string } | null>(null);

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
        setCurrentUser({ id: data.id, email: data.email });
      }
    } catch (_) {}
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/lost-found/items/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setNewItem({
          item_name: '',
          description: '',
          category: 'other',
          location: '',
          status: 'lost',
          contact_info: ''
        });
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

  const buildSmartContactLink = (contactInfo: string): { href: string; label: string } | null => {
    const trimmed = contactInfo.trim();
    if (!trimmed) return null;
    if (trimmed.includes('@')) {
      // Add a basic subject/body and cc the logged-in user
      const subject = encodeURIComponent('Inquiry about your lost item from Campus Hub');
      const body = encodeURIComponent('Hi, I think I might have found your item.');
      const cc = currentUser?.email ? `&cc=${encodeURIComponent(currentUser.email)}` : '';
      return { href: `mailto:${trimmed}?subject=${subject}&body=${body}${cc}` , label: 'Send Email' };
    }
    const digits = trimmed.replace(/[^0-9+]/g, '');
    if (digits.length >= 8) {
      return { href: `tel:${digits}`, label: 'Call' };
    }
    return null;
  };

  const isCollegeEmail = (email: string | undefined | null): boolean => {
    if (!email) return false;
    const domain = process.env.NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN || 'edu';
    return email.toLowerCase().endsWith(domain.toLowerCase());
  };

  const extractPhoneFromString = (text: string | undefined | null): string | null => {
    if (!text) return null;
    const digits = text.replace(/[^0-9+]/g, '');
    return digits.length >= 8 ? digits : null;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
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
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-600 mt-2">
            Report lost items or help others find their belongings
          </p>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
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
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="claimed">Claimed</option>
              <option value="returned">Returned</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report Item
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.item_name}</CardTitle>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {item.location}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {item.reported_by.first_name} {item.reported_by.last_name}
                </div>
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {item.status === 'found' && (
                  currentUser && item.reported_by?.id === currentUser.id ? (
                    <span className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-center">
                      Posted by You
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setClaimModalItem(item);
                        setClaimForm({ details: '', contact: currentUser?.email || '', proofFile: null });
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Claim This Item
                    </button>
                  )
                )}
                {item.status === 'lost' && (
                  <button
                    onClick={() => openContactModal(item)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Contact Owner
                  </button>
                )}
                {item.status === 'claimed' && (
                  <button className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                    Already Claimed
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Report Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
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
                  required
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
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newItem.status}
                  onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Info</label>
                <input
                  type="text"
                  value={newItem.contact_info}
                  onChange={(e) => setNewItem({...newItem, contact_info: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Phone or email"
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
                  Report Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Owner Modal */}
      {contactModalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                <p className="text-gray-500">Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 break-all">{contactModalItem.reported_by.email || 'Not provided'}</p>
                  {contactModalItem.reported_by.email && (
                    <button
                      onClick={() => copyContactInfoToClipboard(contactModalItem.reported_by.email!)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 break-all">{contactModalItem.reported_by.phone_number || extractPhoneFromString(contactModalItem.contact_info) || 'Not provided'}</p>
                  {(contactModalItem.reported_by.phone_number || extractPhoneFromString(contactModalItem.contact_info)) && (
                    <button
                      onClick={() => copyContactInfoToClipboard((contactModalItem.reported_by.phone_number || extractPhoneFromString(contactModalItem.contact_info))!)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={closeContactModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Close
              </button>
              {contactModalItem.contact_info && buildSmartContactLink(contactModalItem.contact_info) && (
                (() => {
                  const link = buildSmartContactLink(contactModalItem.contact_info)!;
                  const emailMode = link.href.startsWith('mailto:');
                  const allowed = emailMode ? isCollegeEmail(currentUser?.email) : true;
                  return (
                    <a
                      href={allowed ? link.href : undefined}
                      onClick={(e) => { if (!allowed) { e.preventDefault(); alert('Please use your college email to contact the owner.'); } }}
                      className={`flex-1 px-4 py-2 text-white text-center rounded-lg ${allowed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                    >
                      {emailMode ? (allowed ? 'Send Email (College ID)' : 'Email (College ID required)') : link.label}
                    </a>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Request Modal */}
      {claimModalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Claim This Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleClaimItem(claimModalItem.id);
              }}
              className="space-y-4"
            >
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
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setClaimModalItem(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Claim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
