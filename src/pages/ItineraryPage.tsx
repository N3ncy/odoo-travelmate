import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itineraryService, reminderService, packingService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { ItineraryItem, TripReminder, PackingItem } from '@/types';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Bell,
  CheckCircle,
  Circle,
  Package,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Coffee,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Users,
  X,
  AlertTriangle,
  GripVertical,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_CONFIG = {
  transport: { icon: Plane, color: 'bg-blue-500', label: 'Transport' },
  accommodation: { icon: Hotel, color: 'bg-purple-500', label: 'Stay' },
  food: { icon: Utensils, color: 'bg-orange-500', label: 'Food' },
  activity: { icon: Camera, color: 'bg-pink-500', label: 'Activity' },
  sightseeing: { icon: MapPin, color: 'bg-emerald-500', label: 'Sightseeing' },
  rest: { icon: Coffee, color: 'bg-gray-500', label: 'Rest' },
  other: { icon: Circle, color: 'bg-gray-400', label: 'Other' },
};

const REMINDER_TYPES = {
  packing: { icon: Package, color: 'text-blue-500' },
  document: { icon: Copy, color: 'text-purple-500' },
  booking: { icon: Calendar, color: 'text-orange-500' },
  meeting: { icon: Users, color: 'text-pink-500' },
  activity: { icon: Camera, color: 'text-emerald-500' },
  custom: { icon: Bell, color: 'text-gray-500' },
};

export function ItineraryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'itinerary' | 'reminders' | 'packing'>('itinerary');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [reminders, setReminders] = useState<TripReminder[]>([]);
  const [packingList, setPackingList] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  // View toggle (List / Calendar) — persisted to localStorage
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(() => {
    return (localStorage.getItem('itinerary_view_mode') as 'list' | 'calendar') || 'list';
  });

  const changeViewMode = (mode: 'list' | 'calendar') => {
    setViewMode(mode);
    localStorage.setItem('itinerary_view_mode', mode);
  };

  // Drag-and-drop state
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Modal states
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddPacking, setShowAddPacking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    day_number: 1,
    title: '',
    description: '',
    location_name: '',
    start_time: '',
    end_time: '',
    category: 'activity' as const,
  });

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_type: 'custom' as const,
    due_date: '',
    notify_before_minutes: 60,
  });

  const [newPackingItem, setNewPackingItem] = useState({
    item_name: '',
    category: 'other' as const,
    quantity: 1,
    is_shared: false,
  });

  useEffect(() => {
    if (tripId) {
      loadData();
    }
  }, [tripId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itineraryData, remindersData, packingData] = await Promise.all([
        itineraryService.getItinerary(tripId!),
        reminderService.getReminders(tripId!),
        packingService.getPackingList(tripId!),
      ]);
      setItinerary(itineraryData);
      setReminders(remindersData);
      setPackingList(packingData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      const item = await itineraryService.addItineraryItem({
        trip_id: tripId,
        ...newItem,
        date: new Date().toISOString(),
      });
      setItinerary([...itinerary, item]);
      setShowAddItem(false);
      setNewItem({
        day_number: 1,
        title: '',
        description: '',
        location_name: '',
        start_time: '',
        end_time: '',
        category: 'activity',
      });
      toast.success('Item added!');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleAddReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.due_date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const reminder = await reminderService.createReminder({
        trip_id: tripId,
        ...newReminder,
      });
      setReminders([...reminders, reminder]);
      setShowAddReminder(false);
      setNewReminder({
        title: '',
        description: '',
        reminder_type: 'custom',
        due_date: '',
        notify_before_minutes: 60,
      });
      toast.success('Reminder added!');
    } catch (error) {
      toast.error('Failed to add reminder');
    }
  };

  const handleToggleReminder = async (reminderId: string) => {
    try {
      await reminderService.markComplete(reminderId);
      setReminders(reminders.map(r =>
        r.id === reminderId ? { ...r, is_completed: true } : r
      ));
      toast.success('Marked as complete!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleAddPackingItem = async () => {
    if (!newPackingItem.item_name.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    try {
      const item = await packingService.addItem({
        trip_id: tripId,
        ...newPackingItem,
      });
      setPackingList([...packingList, item]);
      setShowAddPacking(false);
      setNewPackingItem({
        item_name: '',
        category: 'other',
        quantity: 1,
        is_shared: false,
      });
      toast.success('Item added!');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleTogglePacked = async (itemId: string, isPacked: boolean) => {
    try {
      await packingService.togglePacked(itemId, !isPacked);
      setPackingList(packingList.map(i =>
        i.id === itemId ? { ...i, is_packed: !isPacked } : i
      ));
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleShare = async () => {
    try {
      const share = await itineraryService.shareItinerary(tripId!, {
        share_type: 'link',
        permissions: 'view',
      });
      navigator.clipboard.writeText(share.share_url || '');
      toast.success('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const toggleDay = (day: number) => {
    if (expandedDays.includes(day)) {
      setExpandedDays(expandedDays.filter(d => d !== day));
    } else {
      setExpandedDays([...expandedDays, day]);
    }
  };

  // ── Drag-and-Drop Handlers ────────────────────────────────────────────────
  const handleDragStart = (day: number) => {
    setDraggedDay(day);
  };

  const handleDragOver = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (targetDay: number) => {
    if (draggedDay === null || draggedDay === targetDay) {
      setDraggedDay(null);
      setDragOverDay(null);
      return;
    }
    // Remap items: swap day numbers
    const updated = itinerary.map((item) => {
      if (item.day_number === draggedDay) return { ...item, day_number: targetDay };
      if (item.day_number === targetDay) return { ...item, day_number: draggedDay };
      return item;
    });
    setItinerary(updated);
    setDraggedDay(null);
    setDragOverDay(null);
    toast.success('Days reordered!');
  };

  const handleDragEnd = () => {
    setDraggedDay(null);
    setDragOverDay(null);
  };

  // Group itinerary by day
  const itineraryByDay = itinerary.reduce((acc, item) => {
    const day = item.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);

  const days = Object.keys(itineraryByDay).map(Number).sort((a, b) => a - b);

  // ── Calendar helpers ─────────────────────────────────────────────────────
  const calendarDayDots: Record<string, { day: number; title: string }[]> = {};
  itinerary.forEach((item) => {
    if (item.date) {
      const key = item.date.slice(0, 10);
      if (!calendarDayDots[key]) calendarDayDots[key] = [];
      calendarDayDots[key].push({ day: item.day_number, title: item.title });
    }
  });

  // Determine calendar month (first itinerary item date, or today)
  const calendarMonth = itinerary.length > 0 && itinerary[0].date
    ? new Date(itinerary[0].date)
    : new Date();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay(); // 0=Sun

  // Group packing by category
  const packingByCategory = packingList.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Trip Planner</h1>
                <p className="text-gray-400 text-sm">Organize your journey</p>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'itinerary', label: 'Itinerary', icon: Calendar },
              { id: 'reminders', label: 'Reminders', icon: Bell },
              { id: 'packing', label: 'Packing', icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Day by Day</h2>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => changeViewMode('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    List
                  </button>
                  <button
                    onClick={() => changeViewMode('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Calendar
                  </button>
                </div>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                <div className="grid grid-cols-7 text-center">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="py-2 text-xs font-semibold text-gray-400">{d}</div>
                  ))}
                  {Array.from({ length: startWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 border-t border-gray-50" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dateKey = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
                    const dots = calendarDayDots[dateKey] || [];
                    const isToday = new Date().toISOString().slice(0,10) === dateKey;
                    return (
                      <div
                        key={i}
                        className={`h-16 border-t border-gray-50 p-1 flex flex-col items-center ${
                          dots.length > 0 ? 'bg-emerald-50' : ''
                        }`}
                        onClick={() => {
                          if (dots.length > 0) {
                            const firstDay = dots[0].day;
                            setExpandedDays(prev => prev.includes(firstDay) ? prev : [...prev, firstDay]);
                            changeViewMode('list');
                          }
                        }}
                        style={{ cursor: dots.length > 0 ? 'pointer' : 'default' }}
                      >
                        <span className={`text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday ? 'bg-emerald-600 text-white' : 'text-gray-700'
                        }`}>{i+1}</span>
                        {dots.map((dot, di) => (
                          <span key={di} className="w-full truncate text-[9px] text-center px-0.5 mt-0.5 bg-emerald-200 text-emerald-800 rounded leading-tight">
                            {dot.title}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'list' && days.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No itinerary yet</h3>
                <p className="text-gray-500 text-sm">Start planning your trip!</p>
              </div>
            ) : viewMode === 'list' ? (
              days.map((day) => {
                const dayItems = itineraryByDay[day].sort((a, b) =>
                  (a.start_time || '').localeCompare(b.start_time || '')
                );
                const isExpanded = expandedDays.includes(day);
                const isDragging = draggedDay === day;
                const isDragOver = dragOverDay === day;

                return (
                  <div
                    key={day}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                      isDragOver ? 'border-emerald-400 shadow-md' : 'border-gray-200'
                    } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
                    draggable
                    onDragStart={() => handleDragStart(day)}
                    onDragOver={(e) => handleDragOver(e, day)}
                    onDrop={() => handleDrop(day)}
                    onDragEnd={handleDragEnd}
                  >
                    <button
                      onClick={() => toggleDay(day)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1 -ml-1"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-emerald-600">{day}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Day {day}</h3>
                          <p className="text-sm text-gray-500">{dayItems.length} activities</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 space-y-3">
                        {dayItems.map((item) => {
                          const config = CATEGORY_CONFIG[item.category];
                          const Icon = config.icon;

                          return (
                            <div
                              key={item.id}
                              className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                            >
                              <div className={`w-10 h-10 ${config.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                                    {item.description && (
                                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                                    )}
                                  </div>
                                  {item.start_time && (
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {item.start_time}
                                      {item.end_time && ` - ${item.end_time}`}
                                    </span>
                                  )}
                                </div>
                                {item.location_name && (
                                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {item.location_name}
                                  </div>
                                )}
                                {item.booking_reference && (
                                  <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs inline-block">
                                    Ref: {item.booking_reference}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : null}
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Trip Reminders</h2>
              <button
                onClick={() => setShowAddReminder(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No reminders</h3>
                <p className="text-gray-500 text-sm">Add reminders to stay on track!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map((reminder) => {
                  const config = REMINDER_TYPES[reminder.reminder_type];
                  const Icon = config.icon;
                  const isOverdue = new Date(reminder.due_date) < new Date() && !reminder.is_completed;

                  return (
                    <div
                      key={reminder.id}
                      className={`flex items-start gap-3 p-4 bg-white rounded-2xl border ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={`mt-1 ${reminder.is_completed ? 'text-emerald-500' : 'text-gray-300'}`}
                      >
                        {reminder.is_completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <h4 className={`font-medium ${reminder.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {reminder.title}
                          </h4>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOverdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {formatDate(reminder.due_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Packing Tab */}
        {activeTab === 'packing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Packing List</h2>
                <p className="text-sm text-gray-500">
                  {packingList.filter(i => i.is_packed).length}/{packingList.length} items packed
                </p>
              </div>
              <button
                onClick={() => setShowAddPacking(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Progress bar */}
            {packingList.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Packing Progress</span>
                  <span className="font-medium text-emerald-600">
                    {Math.round((packingList.filter(i => i.is_packed).length / packingList.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(packingList.filter(i => i.is_packed).length / packingList.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {packingList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No items yet</h3>
                <p className="text-gray-500 text-sm">Start adding items to pack!</p>
              </div>
            ) : (
              Object.entries(packingByCategory).map(([category, items]) => (
                <div key={category} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-4"
                      >
                        <button
                          onClick={() => handleTogglePacked(item.id, item.is_packed)}
                          className={item.is_packed ? 'text-emerald-500' : 'text-gray-300'}
                        >
                          {item.is_packed ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex-1">
                          <span className={item.is_packed ? 'text-gray-400 line-through' : 'text-gray-900'}>
                            {item.item_name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                          )}
                        </div>
                        {item.is_shared && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                            Shared
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Itinerary Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Itinerary Item</h2>
                <button onClick={() => setShowAddItem(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.day_number}
                      onChange={(e) => setNewItem({ ...newItem, day_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    >
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="e.g., Visit Taj Mahal"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newItem.location_name}
                    onChange={(e) => setNewItem({ ...newItem, location_name: e.target.value })}
                    placeholder="e.g., Agra, India"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newItem.start_time}
                      onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newItem.end_time}
                      onChange={(e) => setNewItem({ ...newItem, end_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Reminder</h2>
                <button onClick={() => setShowAddReminder(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newReminder.reminder_type}
                    onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  >
                    <option value="packing">Packing</option>
                    <option value="document">Document</option>
                    <option value="booking">Booking</option>
                    <option value="meeting">Meeting</option>
                    <option value="activity">Activity</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="e.g., Book hotel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newReminder.due_date}
                    onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddReminder(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReminder}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                >
                  Add Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Packing Item Modal */}
      {showAddPacking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Packing Item</h2>
                <button onClick={() => setShowAddPacking(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newPackingItem.item_name}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, item_name: e.target.value })}
                    placeholder="e.g., Sunscreen"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newPackingItem.category}
                      onChange={(e) => setNewPackingItem({ ...newPackingItem, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="toiletries">Toiletries</option>
                      <option value="electronics">Electronics</option>
                      <option value="documents">Documents</option>
                      <option value="medicine">Medicine</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={newPackingItem.quantity}
                      onChange={(e) => setNewPackingItem({ ...newPackingItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPackingItem.is_shared}
                    onChange={(e) => setNewPackingItem({ ...newPackingItem, is_shared: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Shared with group</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddPacking(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPackingItem}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Share Itinerary</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">Share your trip itinerary with friends and family.</p>

              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  <Copy className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Copy Link</span>
                </button>
                <button className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
