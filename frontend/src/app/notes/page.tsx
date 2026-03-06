'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Calendar,
  Plus,
  Eye,
  X,
  Trash2
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  description: string;
  subject: string;
  subject_display: string;
  file: string | null;
  file_url: string | null;
  uploaded_by: {
    id?: number;
    first_name: string;
    last_name: string;
  };
  downloads: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    subject: 'other',
    file_url: '',
    file: null as File | null,
    is_public: true
  });

  useEffect(() => {
    fetchNotes();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserRole(data.role || '');
      }
    } catch (_) {}
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/notes/notes/', {
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
        setNotes(normalized as Note[]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('title', newNote.title);
      formData.append('description', newNote.description);
      formData.append('subject', newNote.subject);
      formData.append('is_public', newNote.is_public.toString());
      
      if (newNote.file) {
        formData.append('file', newNote.file);
      }
      if (newNote.file_url) {
        formData.append('file_url', newNote.file_url);
      }

      const response = await fetch('http://localhost:8000/api/notes/notes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      if (response.ok) {
        setShowUploadModal(false);
        setNewNote({
          title: '',
          description: '',
          subject: 'other',
          file_url: '',
          file: null,
          is_public: true
        });
        fetchNotes();
      } else {
        const errorData = await response.json();
        alert('Upload failed: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error uploading note:', error);
      alert('Upload failed');
    }
  };

  const handleDownload = async (noteId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/notes/notes/${noteId}/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.file_url) window.open(data.file_url, '_blank');
        } else {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Try to get filename from content-disposition
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) filename = filenameMatch[1];
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  const handlePreview = (note: Note) => {
    if (!isPreviewableFile(note)) {
      return;
    }
    setPreviewNote(note);
  };

  const handleDeleteNote = async (noteId: number, title: string) => {
    const firstConfirm = window.confirm(`Delete note "${title}"?`);
    if (!firstConfirm) return;
    const secondConfirm = window.confirm('This action is permanent. Are you absolutely sure?');
    if (!secondConfirm) return;
    try {
      setDeletingNoteId(noteId);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/notes/notes/${noteId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok || response.status === 204) {
        fetchNotes();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.detail || 'Failed to delete note.');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note.');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleClosePreview = () => {
    setPreviewNote(null);
  };

  const getFileUrl = (note: Note): string | null => {
    if (!note.file) {
      return null;
    }
    if (note.file.startsWith('http://') || note.file.startsWith('https://')) {
      return note.file;
    }
    return `http://localhost:8000${note.file}`;
  };

  const isPreviewableFile = (note: Note): boolean => {
    if (!note.file) {
      return false;
    }
    const filePath = note.file.toLowerCase();
    return (
      filePath.endsWith('.pdf') ||
      filePath.endsWith('.png') ||
      filePath.endsWith('.jpg') ||
      filePath.endsWith('.jpeg') ||
      filePath.endsWith('.gif') ||
      filePath.endsWith('.webp') ||
      filePath.endsWith('.txt')
    );
  };

  const filteredNotes = (Array.isArray(notes) ? notes : []).filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || note.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts' },
    { value: 'literature', label: 'Literature' },
    { value: 'history', label: 'History' },
    { value: 'other', label: 'Other' }
  ];

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'computer_science': return 'bg-blue-100 text-blue-800';
      case 'mathematics': return 'bg-purple-100 text-purple-800';
      case 'physics': return 'bg-indigo-100 text-indigo-800';
      case 'chemistry': return 'bg-pink-100 text-pink-800';
      case 'biology': return 'bg-green-100 text-green-800';
      case 'engineering': return 'bg-orange-100 text-orange-800';
      case 'business': return 'bg-yellow-100 text-yellow-800';
      case 'arts': return 'bg-red-100 text-red-800';
      case 'literature': return 'bg-teal-100 text-teal-800';
      case 'history': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
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
          <h1 className="text-3xl font-bold text-[#030e12]">Notes Sharing</h1>
          <p className="text-[#030e12]/85 mt-2">
            Share and discover academic notes with your campus community.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload Note
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${getSubjectColor(note.subject)}`}>
                      {note.subject_display}
                    </span>
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                      {note.title}
                    </CardTitle>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {note.description}
                </p>
                
                <div className="space-y-3 text-sm text-gray-500 mb-6 bg-gray-50/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">By {note.uploaded_by.first_name} {note.uploaded_by.last_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{note.downloads} downloads</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button
                    onClick={() => handleDownload(note.id)}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    {note.file ? 'Download' : 'Open Link'}
                  </button>
                  {isPreviewableFile(note) && (
                    <button
                      onClick={() => handlePreview(note)}
                      className="w-full sm:w-auto flex items-center justify-center px-3 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {currentUserRole === 'admin' && (
                    <button
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      disabled={deletingNoteId === note.id}
                      className="w-full sm:w-auto flex items-center justify-center px-3 py-2.5 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="form-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-modal-shell sm:max-w-md"
          >
            <h3 className="form-modal-header text-lg font-semibold p-4 sm:p-6 pb-3">Upload New Note</h3>
            <form onSubmit={handleUploadNote} className="flex-1 flex flex-col min-h-0">
              <div className="form-modal-body p-4 sm:p-6 pb-28 sm:pb-24 space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={newNote.subject}
                  onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subjects.slice(1).map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload File (PDF, DOCX, etc.)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewNote({...newNote, file: e.target.files?.[0] || null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Or provide a URL below</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File URL (optional)
                </label>
                <input
                  type="url"
                  value={newNote.file_url}
                  onChange={(e) => setNewNote({...newNote, file_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newNote.is_public}
                  onChange={(e) => setNewNote({...newNote, is_public: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                  Make this note public
                </label>
              </div>
              
              </div>

              <div className="form-modal-footer p-4 sm:p-6 pb-[max(env(safe-area-inset-bottom),1rem)] flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg w-full max-w-4xl h-[85vh] min-h-[70vh] my-4 sm:my-0 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewNote.title}</h3>
                <p className="text-sm text-gray-500">
                  {previewNote.subject_display} • By {previewNote.uploaded_by.first_name} {previewNote.uploaded_by.last_name}
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
              {getFileUrl(previewNote) ? (
                <iframe
                  src={getFileUrl(previewNote)!}
                  className="w-full h-full rounded-md border border-gray-200 bg-white"
                  title="Document Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Preview not available for this note.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewNote.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download File
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}



