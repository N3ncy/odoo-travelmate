import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Users,
  MapPin,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Check,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Navigation,
  AlertTriangle,
  Copy,
  Share2,
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  Map,
} from 'lucide-react';
import {
  groupTripService,
  itineraryService,
  reminderService,
  groupSafetyService,
  type GroupTrip,
  type GroupParticipant,
  type SharedItinerary,
  type TripReminder,
  type ItineraryActivity,
  type ChecklistItem,
} from '@/services/groupService';
import { useAuthStore, useLocationStore } from '@/store';
import { useLocation } from '@/hooks/useLocation';
import toast from 'react-hot-toast';

export function GroupTripPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { startSharing, stopSharing, isSharing, triggerPanic, currentLocation } = useLocation();

  const [trip, setTrip] = useState<GroupTrip | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [reminders, setReminders] = useState<TripReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'participants' | 'safety'>('overview');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [distanceAlerts, setDistanceAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchGroupData();
    }
  }, [id]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupTrips, itin, rems] = await Promise.all([
        groupTripService.getGroupTrips('demo-user'),
        itineraryService.getItinerary(id!),
        reminderService.getReminders(id!),
      ]);

      const currentTrip = groupTrips.find(t => t.id === id);
      if (currentTrip) {
        setTrip(currentTrip);
        setParticipants(currentTrip.participants);
      }
      setItinerary(itin);
      setReminders(rems);

      // Check group distances
      if (currentTrip) {
        const alerts = await groupSafetyService.checkGroupDistance(id!, currentTrip.participants);
        setDistanceAlerts(alerts);
      }
    } catch (error) {
      console.error('Failed to fetch group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivity = async (activityId: string) => {
    if (!id) return;
    await itineraryService.toggleActivityComplete(id, activityId);
    setItinerary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(day => ({
          ...day,
          activities: day.activities.map(act =>
            act.id === activityId ? { ...act, completed: !act.completed } : act
          ),
        })),
      };
    });
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!id) return;
    await itineraryService.toggleChecklistItem(id, itemId);
    setItinerary(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      };
    });
  };

  const handleAddChecklistItem = async () => {
    if (!id || !newChecklistItem.trim()) return;
    const item = await itineraryService.addChecklistItem(id, newChecklistItem.trim());
    setItinerary(prev => {
      if (!prev) return prev;
      return { ...prev, checklist: [...prev.checklist, item] };
    });
    setNewChecklistItem('');
    toast.success('Item added');
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText('RISHIKESH2025');
    toast.success('Invite code copied!');
  };

  const handlePanicAlert = async () => {
    if (!id || !currentLocation) {
      toast.error('Unable to get location');
      return;
    }
    try {
      await triggerPanic(id, 'demo-user');
      await groupSafetyService.notifyGroupPanic(id, 'demo-user', participants);
      toast.success('Emergency alert sent to all group members!', { icon: '🚨', duration: 5000 });
    } catch (error) {
      toast.error('Failed to send alert');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transport': return '🚗';
      case 'accommodation': return '🏨';
      case 'activity': return '🎯';
      case 'food': return '🍽️';
      case 'free_time': return '☕';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip not found</h2>
          <Link to="/trips" className="text-emerald-600 hover:underline">Browse trips</Link>
        </div>
      </div>
    );
  }

  const acceptedParticipants = participants.filter(p => p.status === 'accepted');
  const pendingParticipants = participants.filter(p => p.status === 'pending');
  const isAdmin = participants.find(p => p.user_id === 'demo-user')?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-purple-200 text-sm mb-2">
            <Users className="w-4 h-4" />
            <span>Group Trip</span>
            <span>•</span>
            <span>{acceptedParticipants.length} travelers</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">{trip.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-purple-100 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {/* Participant Avatars */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex -space-x-2">
              {acceptedParticipants.slice(0, 5).map((p) => (
                <img
                  key={p.id}
                  src={p.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.profile?.full_name}`}
                  alt={p.profile?.full_name}
                  className="w-10 h-10 rounded-full border-2 border-purple-600"
                  title={p.profile?.full_name}
                />
              ))}
              {acceptedParticipants.length > 5 && (
                <div className="w-10 h-10 rounded-full bg-purple-700 border-2 border-purple-600 flex items-center justify-center text-sm font-medium">
                  +{acceptedParticipants.length - 5}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: Map },
              { key: 'itinerary', label: 'Itinerary', icon: Calendar },
              { key: 'participants', label: 'Members', icon: Users },
              { key: 'safety', label: 'Safety', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-200 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  to="/chat"
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Group Chat</span>
                </Link>

                <button
                  onClick={() => setShowReminderModal(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Reminders</span>
                </button>

                <button
                  onClick={() => setActiveTab('itinerary')}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Itinerary</span>
                </button>

                <button
                  onClick={() => startSharing(id!, 'demo-user')}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSharing ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Navigation className={`w-5 h-5 ${isSharing ? 'text-green-600' : 'text-gray-600'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {isSharing ? 'Sharing' : 'Share Location'}
                  </span>
                </button>
              </div>

              {/* Trip Description */}
              {trip.description && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">About This Trip</h3>
                  <p className="text-gray-600">{trip.description}</p>
                </div>
              )}

              {/* Shared Notes */}
              {itinerary?.shared_notes && itinerary.shared_notes.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Shared Notes</h3>
                  <ul className="space-y-2">
                    {itinerary.shared_notes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upcoming Activities */}
              {itinerary && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Coming Up</h3>
                  <div className="space-y-3">
                    {itinerary.days[0]?.activities.slice(0, 3).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {activity.time} {activity.location && `• ${activity.location}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleActivity(activity.id)}
                          className={`p-2 rounded-lg ${
                            activity.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Checklist */}
              {itinerary && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Group Checklist</h3>
                  <div className="space-y-2 mb-4">
                    {itinerary.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 group"
                      >
                        <button
                          onClick={() => handleToggleChecklist(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.checked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                        <span className={`flex-1 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add item..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Reminders */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Reminders</h3>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="text-emerald-600 text-sm font-medium hover:underline"
                  >
                    Add
                  </button>
                </div>
                {reminders.length > 0 ? (
                  <div className="space-y-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                        <Bell className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{reminder.title}</p>
                          <p className="text-sm text-gray-500">{reminder.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No reminders set</p>
                )}
              </div>

              {/* Distance Alerts */}
              {distanceAlerts.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold">Distance Alerts</h3>
                  </div>
                  <div className="space-y-2">
                    {distanceAlerts.map((alert) => (
                      <p key={alert.id} className="text-sm text-red-600">
                        {alert.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && itinerary && (
          <div className="max-w-4xl mx-auto space-y-4">
            {itinerary.days.map((day) => (
              <div key={day.day_number} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === day.day_number ? null : day.day_number)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs text-purple-600">Day</span>
                      <span className="text-lg font-bold text-purple-700">{day.day_number}</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{day.title}</h3>
                      <p className="text-sm text-gray-500">{format(new Date(day.date), 'EEEE, MMMM d')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {day.activities.filter(a => a.completed).length}/{day.activities.length} done
                    </span>
                    {expandedDay === day.day_number ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedDay === day.day_number && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="space-y-3">
                      {day.activities.map((activity, idx) => (
                        <div
                          key={activity.id}
                          className={`flex items-start gap-4 p-4 rounded-xl ${
                            activity.completed ? 'bg-gray-50' : 'bg-white border border-gray-100'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                            <span className="text-xs text-gray-500 mt-1">{activity.time}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${activity.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {activity.title}
                            </h4>
                            {activity.description && (
                              <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                            )}
                            {activity.location && (
                              <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleToggleActivity(activity.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              activity.completed
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {day.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">📝 {day.notes}</p>
                      </div>
                    )}

                    {isAdmin && (
                      <button className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-medium hover:underline">
                        <Plus className="w-4 h-4" />
                        Add Activity
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Accepted Members */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">
                Members ({acceptedParticipants.length})
              </h3>
              <div className="space-y-4">
                {acceptedParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={participant.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.profile?.full_name}`}
                        alt={participant.profile?.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                      {participant.otp_verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{participant.profile?.full_name}</p>
                        {participant.role === 'admin' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Joined {format(new Date(participant.joined_at || ''), 'MMM d')}
                      </p>
                    </div>
                    {isAdmin && participant.user_id !== 'demo-user' && (
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites */}
            {pendingParticipants.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Pending ({pendingParticipants.length})
                </h3>
                <div className="space-y-4">
                  {pendingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-4">
                      <img
                        src={participant.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.profile?.full_name}`}
                        alt={participant.profile?.full_name}
                        className="w-12 h-12 rounded-full opacity-60"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{participant.profile?.full_name}</p>
                        <p className="text-sm text-yellow-600">Invite pending</p>
                      </div>
                      {isAdmin && (
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          Resend invite
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite Section */}
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-2">Invite More Travelers</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share this code with friends to invite them to your trip
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white rounded-xl font-mono text-lg">
                  <span>RISHIKESH2025</span>
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Location Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Location Sharing</h3>
              <div className="space-y-4">
                {acceptedParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-4">
                    <img
                      src={participant.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.profile?.full_name}`}
                      alt={participant.profile?.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{participant.profile?.full_name}</p>
                      {participant.last_location ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Last updated {format(new Date(participant.last_location.timestamp), 'HH:mm')}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Location not shared</p>
                      )}
                    </div>
                    {participant.last_location && (
                      <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Map className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Group Safety Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Distance Alert Radius</p>
                    <p className="text-sm text-gray-500">Alert when someone is far from group</p>
                  </div>
                  <span className="text-emerald-600 font-medium">200m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Auto Location Share</p>
                    <p className="text-sm text-gray-500">Automatically share when trip is active</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Panic Notify All</p>
                    <p className="text-sm text-gray-500">Alert all members on panic button</p>
                  </div>
                  <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-4">Emergency Actions</h3>
              <button
                onClick={handlePanicAlert}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-6 h-6" />
                Emergency Alert (SOS)
              </button>
              <p className="text-sm text-red-700 mt-3 text-center">
                This will alert all group members and your emergency contacts
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Invite to Trip</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">Share this invite code with your travel buddies:</p>
              <div className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-xl">
                <span className="text-2xl font-mono font-bold text-purple-700">RISHIKESH2025</span>
                <button
                  onClick={handleCopyInviteCode}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500 mb-3">Or invite by email:</p>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 mb-3"
              />
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Reminder</h3>
              <button onClick={() => setShowReminderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Pack bags"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
                <input
                  type="text"
                  placeholder="Additional details..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remind At</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={() => {
                  toast.success('Reminder added!');
                  setShowReminderModal(false);
                }}
                className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
