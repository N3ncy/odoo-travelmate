import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  FileText,
  Edit2,
  Trash2,
  Check,
  X,
  StickyNote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tripService } from '@/services/api';
import type { Trip } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TripNote {
  id: string;
  title: string;
  body: string;
  stop: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const STOP_OPTIONS = ['General', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

// ─── Component ───────────────────────────────────────────────────────────────

export function TripNotesPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New note form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newStop, setNewStop] = useState('General');

  // Edit note form
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStop, setEditStop] = useState('General');

  const storageKey = `trip_notes_${tripId}`;

  // ─── Load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (tripId) {
      loadTrip();
      loadNotes();
    }
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const data = await tripService.getTrip(tripId!);
      setTrip(data);
    } catch {
      // silently fail — still show notes
    }
  };

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setNotes(JSON.parse(stored));
    } catch {
      setNotes([]);
    }
  };

  const saveNotes = (updated: TripNote[]) => {
    setNotes(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // ─── Add ──────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!newBody.trim()) {
      toast.error('Please enter a note');
      return;
    }
    const note: TripNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      stop: newStop,
      createdAt: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    setNewTitle('');
    setNewBody('');
    setNewStop('General');
    setShowAddForm(false);
    toast.success('Note added!');
  };

  // ─── Edit ─────────────────────────────────────────────────────────────

  const startEdit = (note: TripNote) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
    setEditStop(note.stop);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editBody.trim()) {
      toast.error('Title and note are required');
      return;
    }
    const updated = notes.map((n) =>
      n.id === editingId ? { ...n, title: editTitle.trim(), body: editBody.trim(), stop: editStop } : n
    );
    saveNotes(updated);
    setEditingId(null);
    toast.success('Note updated!');
  };

  const cancelEdit = () => setEditingId(null);

  // ─── Delete ───────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
    toast.success('Note deleted');
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Trip Notes</h1>
                {trip && <p className="text-orange-100 text-sm">{trip.title}</p>}
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Add Form (Inline) */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-500" />
              New Note
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Must-try restaurants in Goa"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note *</label>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">For (Stop / Day)</label>
              <select
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {STOP_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600"
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 && !showAddForm ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <StickyNote className="w-10 h-10 text-amber-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">No notes yet</h3>
            <p className="text-gray-500 mb-6">Start jotting down ideas!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600"
            >
              <Plus className="w-4 h-4" />
              Write First Note
            </button>
          </div>
        ) : (
          notes.map((note) =>
            editingId === note.id ? (
              // ── Edit Mode ──
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border-2 border-blue-200 p-5 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-500" />
                  Editing Note
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stop / Day</label>
                  <select
                    value={editStop}
                    onChange={(e) => setEditStop(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {STOP_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={cancelEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              </div>
            ) : (
              // ── View Mode ──
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{note.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        {note.stop}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(note.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{note.body}</p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
