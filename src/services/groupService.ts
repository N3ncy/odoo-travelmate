// ==========================================
// Phase 2: Group Travel Services
// ==========================================
import { supabase, isDemoMode } from '@/lib/supabase';
import type {
  Trip,
  TripParticipant,
  Profile,
  SafetyAlert,
  CommunityBoard,
  LocationUpdate,
} from '@/types';
import { mockProfiles, mockTrips, mockCommunityBoards, demoUserProfile } from './mockData';

// ==========================================
// Group Trip Types
// ==========================================
export interface GroupTrip extends Trip {
  participants: GroupParticipant[];
  itinerary_shared: boolean;
  group_chat_id?: string;
  safety_settings: GroupSafetySettings;
}

export interface GroupParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'invited' | 'pending' | 'accepted' | 'rejected' | 'left';
  otp_verified: boolean;
  end_otp_verified: boolean;
  last_location?: { lat: number; lng: number; timestamp: string };
  joined_at?: string;
  profile?: Profile;
}

export interface GroupSafetySettings {
  distance_alert_radius: number; // meters
  auto_location_share: boolean;
  panic_notify_all: boolean;
  check_in_interval: number; // minutes
}

export interface GroupInvite {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_email?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invite_code: string;
  created_at: string;
  expires_at: string;
}

export interface TripReminder {
  id: string;
  trip_id: string;
  user_id: string;
  reminder_type: 'departure' | 'checkin' | 'activity' | 'custom';
  title: string;
  message?: string;
  remind_at: string;
  is_sent: boolean;
  created_at: string;
}

export interface SharedItinerary {
  id: string;
  trip_id: string;
  days: ItineraryDay[];
  shared_notes: string[];
  checklist: ChecklistItem[];
  updated_at: string;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  title: string;
  activities: ItineraryActivity[];
  notes?: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  location_coords?: { lat: number; lng: number };
  type: 'transport' | 'accommodation' | 'activity' | 'food' | 'free_time';
  completed: boolean;
  added_by: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  added_by: string;
  assigned_to?: string;
}

export interface CommunityPost {
  id: string;
  board_id: string;
  user_id: string;
  title: string;
  content: string;
  post_type: 'discussion' | 'question' | 'tip' | 'announcement';
  tags: string[];
  upvotes: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
  author?: Profile;
}

// ==========================================
// Mock Data for Phase 2
// ==========================================
const mockGroupParticipants: GroupParticipant[] = [
  {
    id: 'gp-1',
    trip_id: 'trip-3',
    user_id: 'demo-user',
    role: 'admin',
    status: 'accepted',
    otp_verified: true,
    end_otp_verified: false,
    last_location: { lat: 30.0869, lng: 78.2676, timestamp: new Date().toISOString() },
    joined_at: '2024-12-01T10:00:00Z',
    profile: demoUserProfile,
  },
  {
    id: 'gp-2',
    trip_id: 'trip-3',
    user_id: '3',
    role: 'admin',
    status: 'accepted',
    otp_verified: true,
    end_otp_verified: false,
    last_location: { lat: 30.0875, lng: 78.2680, timestamp: new Date().toISOString() },
    joined_at: '2024-12-02T10:00:00Z',
    profile: mockProfiles[2],
  },
  {
    id: 'gp-3',
    trip_id: 'trip-3',
    user_id: '1',
    role: 'member',
    status: 'accepted',
    otp_verified: true,
    end_otp_verified: false,
    last_location: { lat: 30.0880, lng: 78.2690, timestamp: new Date().toISOString() },
    joined_at: '2024-12-03T10:00:00Z',
    profile: mockProfiles[0],
  },
  {
    id: 'gp-4',
    trip_id: 'trip-3',
    user_id: '4',
    role: 'member',
    status: 'pending',
    otp_verified: false,
    end_otp_verified: false,
    profile: mockProfiles[3],
  },
];

const mockItinerary: SharedItinerary = {
  id: 'itin-1',
  trip_id: 'trip-3',
  days: [
    {
      day_number: 1,
      date: '2025-01-20',
      title: 'Arrival & Exploration',
      activities: [
        {
          id: 'act-1',
          time: '10:00',
          title: 'Arrive at Rishikesh',
          description: 'Meet at Haridwar station, shared cab to hostel',
          type: 'transport',
          completed: false,
          added_by: 'demo-user',
        },
        {
          id: 'act-2',
          time: '14:00',
          title: 'Check-in at Zostel',
          description: 'Zostel Rishikesh - 4 bed dorm',
          location: 'Zostel Rishikesh',
          type: 'accommodation',
          completed: false,
          added_by: '3',
        },
        {
          id: 'act-3',
          time: '16:00',
          title: 'Explore Laxman Jhula',
          description: 'Walk around, visit temples, cafe hopping',
          location: 'Laxman Jhula',
          type: 'activity',
          completed: false,
          added_by: 'demo-user',
        },
        {
          id: 'act-4',
          time: '19:30',
          title: 'Dinner at Little Buddha Cafe',
          type: 'food',
          completed: false,
          added_by: '1',
        },
      ],
      notes: 'Everyone bring sunscreen and comfortable walking shoes!',
    },
    {
      day_number: 2,
      date: '2025-01-21',
      title: 'River Rafting Day',
      activities: [
        {
          id: 'act-5',
          time: '06:00',
          title: 'Sunrise Yoga',
          description: 'Free yoga session at hostel',
          type: 'activity',
          completed: false,
          added_by: '1',
        },
        {
          id: 'act-6',
          time: '09:00',
          title: 'River Rafting - 16km',
          description: 'Shivpuri to Laxman Jhula stretch',
          location: 'Shivpuri',
          type: 'activity',
          completed: false,
          added_by: '3',
        },
        {
          id: 'act-7',
          time: '14:00',
          title: 'Lunch Break',
          type: 'food',
          completed: false,
          added_by: 'demo-user',
        },
        {
          id: 'act-8',
          time: '17:00',
          title: 'Ganga Aarti at Triveni Ghat',
          description: 'Evening ceremony',
          location: 'Triveni Ghat',
          type: 'activity',
          completed: false,
          added_by: '1',
        },
      ],
    },
    {
      day_number: 3,
      date: '2025-01-22',
      title: 'Camping & Bonfire',
      activities: [
        {
          id: 'act-9',
          time: '10:00',
          title: 'Check out & travel to campsite',
          type: 'transport',
          completed: false,
          added_by: '3',
        },
        {
          id: 'act-10',
          time: '12:00',
          title: 'Beach Camping Setup',
          description: 'Camp by the Ganges',
          type: 'accommodation',
          completed: false,
          added_by: '3',
        },
        {
          id: 'act-11',
          time: '20:00',
          title: 'Bonfire & Music Night',
          description: 'Bring guitar if you have one!',
          type: 'activity',
          completed: false,
          added_by: 'demo-user',
        },
      ],
    },
  ],
  shared_notes: [
    'Budget per person: ₹3000-4000 for 3 days',
    'Rafting cost: ₹1200 per person (group discount)',
    'Camping: ₹800 per person including dinner',
    'Emergency contact: Rahul - 9876543210',
  ],
  checklist: [
    { id: 'cl-1', text: 'Book hostel', checked: true, added_by: '3' },
    { id: 'cl-2', text: 'Confirm rafting booking', checked: true, added_by: '3' },
    { id: 'cl-3', text: 'Arrange campsite', checked: false, added_by: 'demo-user', assigned_to: '3' },
    { id: 'cl-4', text: 'Buy snacks for trip', checked: false, added_by: '1' },
    { id: 'cl-5', text: 'First aid kit', checked: false, added_by: 'demo-user', assigned_to: '1' },
    { id: 'cl-6', text: 'Confirm train tickets', checked: true, added_by: 'demo-user' },
  ],
  updated_at: new Date().toISOString(),
};

const mockReminders: TripReminder[] = [
  {
    id: 'rem-1',
    trip_id: 'trip-3',
    user_id: 'demo-user',
    reminder_type: 'departure',
    title: 'Trip starts tomorrow!',
    message: 'Pack your bags and check your tickets',
    remind_at: '2025-01-19T09:00:00Z',
    is_sent: false,
    created_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'rem-2',
    trip_id: 'trip-3',
    user_id: 'demo-user',
    reminder_type: 'activity',
    title: 'Rafting at 9 AM',
    message: 'Don\'t forget waterproof bag for phone',
    remind_at: '2025-01-21T07:00:00Z',
    is_sent: false,
    created_at: '2024-12-05T10:00:00Z',
  },
];

const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'cp-1',
    board_id: 'board-1',
    user_id: '1',
    title: 'Best hostels for solo female travelers in Rishikesh?',
    content: 'Planning a solo trip next month. Looking for safe and social hostels. Any recommendations? My budget is around ₹500-800 per night.',
    post_type: 'question',
    tags: ['rishikesh', 'hostels', 'solo-female'],
    upvotes: 24,
    comments_count: 12,
    is_pinned: false,
    created_at: '2024-12-03T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
    author: mockProfiles[0],
  },
  {
    id: 'cp-2',
    board_id: 'board-1',
    user_id: '2',
    title: 'Safety tips for women traveling alone in India',
    content: 'After 20+ solo trips, here are my top safety tips:\n\n1. Always share your location with family\n2. Book accommodations with good reviews from women\n3. Avoid traveling alone at night\n4. Trust your instincts\n5. Keep emergency numbers saved\n6. Join Traveloop to find verified travel partners!',
    post_type: 'tip',
    tags: ['safety', 'solo-female', 'tips'],
    upvotes: 156,
    comments_count: 34,
    is_pinned: true,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
    author: mockProfiles[1],
  },
  {
    id: 'cp-3',
    board_id: 'board-2',
    user_id: '3',
    title: 'How I did Ladakh in ₹15,000 (including flights!)',
    content: 'Here\'s my complete budget breakdown for a 7-day Ladakh trip:\n\n**Flights:** ₹6,500 (booked 3 months ahead)\n**Stay:** ₹3,500 (homestays + shared dorms)\n**Food:** ₹2,000 (local dhabas)\n**Transport:** ₹2,000 (shared cabs)\n**Activities:** ₹1,000\n\nAsk me anything in comments!',
    post_type: 'tip',
    tags: ['ladakh', 'budget', 'itinerary'],
    upvotes: 89,
    comments_count: 45,
    is_pinned: false,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-04T10:00:00Z',
    author: mockProfiles[2],
  },
  {
    id: 'cp-4',
    board_id: 'board-3',
    user_id: '4',
    title: 'Who else is doing Hampta Pass this December?',
    content: 'Looking for trekking buddies for Hampta Pass trek (Dec 20-25). Anyone interested? We can share costs and experiences!',
    post_type: 'discussion',
    tags: ['hampta-pass', 'trekking', 'december'],
    upvotes: 18,
    comments_count: 8,
    is_pinned: false,
    created_at: '2024-12-04T10:00:00Z',
    updated_at: '2024-12-05T10:00:00Z',
    author: mockProfiles[3],
  },
];

const mockComments: CommunityComment[] = [
  {
    id: 'cc-1',
    post_id: 'cp-1',
    user_id: '2',
    content: 'Zostel Rishikesh is amazing! Great vibes, safe, and you meet so many travelers. Highly recommend the dorms.',
    upvotes: 12,
    created_at: '2024-12-03T12:00:00Z',
    author: mockProfiles[1],
  },
  {
    id: 'cc-2',
    post_id: 'cp-1',
    user_id: '3',
    content: 'Try Bunk Stay too - it\'s smaller but very cozy. The owner aunty is super helpful!',
    upvotes: 8,
    created_at: '2024-12-03T14:00:00Z',
    author: mockProfiles[2],
  },
];

// ==========================================
// Group Trip Service
// ==========================================
export const groupTripService = {
  async getGroupTrips(userId: string): Promise<GroupTrip[]> {
    if (isDemoMode) {
      const groupTrip = mockTrips.find(t => t.id === 'trip-3');
      if (groupTrip) {
        return [{
          ...groupTrip,
          participants: mockGroupParticipants,
          itinerary_shared: true,
          group_chat_id: 'room-2',
          safety_settings: {
            distance_alert_radius: 200,
            auto_location_share: true,
            panic_notify_all: true,
            check_in_interval: 30,
          },
        }];
      }
      return [];
    }
    const { data, error } = await supabase
      .from('trips')
      .select('*, participants:trip_participants(*, profile:profiles(*))')
      .eq('is_group_trip', true)
      .or(`creator_id.eq.${userId},participants.user_id.eq.${userId}`);
    if (error) throw error;
    return data || [];
  },

  async getGroupParticipants(tripId: string): Promise<GroupParticipant[]> {
    if (isDemoMode) {
      return mockGroupParticipants.filter(p => p.trip_id === tripId);
    }
    const { data, error } = await supabase
      .from('trip_participants')
      .select('*, profile:profiles(*)')
      .eq('trip_id', tripId);
    if (error) throw error;
    return data || [];
  },

  async inviteToGroup(tripId: string, inviteeId: string): Promise<GroupInvite> {
    if (isDemoMode) {
      return {
        id: `invite-${Date.now()}`,
        trip_id: tripId,
        inviter_id: 'demo-user',
        invitee_id: inviteeId,
        status: 'pending',
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('group_invites')
      .insert({
        trip_id: tripId,
        inviter_id: 'current-user',
        invitee_id: inviteeId,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async respondToInvite(inviteId: string, accept: boolean): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('group_invites')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', inviteId);
  },

  async updateParticipantRole(tripId: string, userId: string, role: 'admin' | 'member'): Promise<void> {
    if (isDemoMode) {
      const participant = mockGroupParticipants.find(p => p.trip_id === tripId && p.user_id === userId);
      if (participant) participant.role = role;
      return;
    }
    await supabase
      .from('trip_participants')
      .update({ role })
      .eq('trip_id', tripId)
      .eq('user_id', userId);
  },

  async removeParticipant(tripId: string, userId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockGroupParticipants.findIndex(p => p.trip_id === tripId && p.user_id === userId);
      if (idx >= 0) mockGroupParticipants.splice(idx, 1);
      return;
    }
    await supabase
      .from('trip_participants')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', userId);
  },

  async leaveGroup(tripId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('trip_participants')
      .update({ status: 'left', left_at: new Date().toISOString() })
      .eq('trip_id', tripId)
      .eq('user_id', 'current-user');
  },
};

// ==========================================
// Itinerary Service
// ==========================================
export const itineraryService = {
  async getItinerary(tripId: string): Promise<SharedItinerary | null> {
    if (isDemoMode) {
      return tripId === 'trip-3' ? mockItinerary : null;
    }
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('trip_id', tripId)
      .single();
    if (error) return null;
    return data;
  },

  async updateItinerary(tripId: string, updates: Partial<SharedItinerary>): Promise<SharedItinerary> {
    if (isDemoMode) {
      Object.assign(mockItinerary, updates, { updated_at: new Date().toISOString() });
      return mockItinerary;
    }
    const { data, error } = await supabase
      .from('itineraries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('trip_id', tripId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addActivity(tripId: string, dayNumber: number, activity: Omit<ItineraryActivity, 'id'>): Promise<ItineraryActivity> {
    const newActivity: ItineraryActivity = {
      ...activity,
      id: `act-${Date.now()}`,
    };

    if (isDemoMode) {
      const day = mockItinerary.days.find(d => d.day_number === dayNumber);
      if (day) {
        day.activities.push(newActivity);
        day.activities.sort((a, b) => a.time.localeCompare(b.time));
      }
      return newActivity;
    }
    // In production, update the itinerary in DB
    return newActivity;
  },

  async toggleActivityComplete(tripId: string, activityId: string): Promise<void> {
    if (isDemoMode) {
      for (const day of mockItinerary.days) {
        const activity = day.activities.find(a => a.id === activityId);
        if (activity) {
          activity.completed = !activity.completed;
          break;
        }
      }
      return;
    }
    // In production, update in DB
  },

  async addChecklistItem(tripId: string, text: string): Promise<ChecklistItem> {
    const item: ChecklistItem = {
      id: `cl-${Date.now()}`,
      text,
      checked: false,
      added_by: 'demo-user',
    };

    if (isDemoMode) {
      mockItinerary.checklist.push(item);
      return item;
    }
    return item;
  },

  async toggleChecklistItem(tripId: string, itemId: string): Promise<void> {
    if (isDemoMode) {
      const item = mockItinerary.checklist.find(c => c.id === itemId);
      if (item) item.checked = !item.checked;
      return;
    }
  },

  async addSharedNote(tripId: string, note: string): Promise<void> {
    if (isDemoMode) {
      mockItinerary.shared_notes.push(note);
      return;
    }
  },
};

// ==========================================
// Reminder Service
// ==========================================
export const reminderService = {
  async getReminders(tripId: string): Promise<TripReminder[]> {
    if (isDemoMode) {
      return mockReminders.filter(r => r.trip_id === tripId);
    }
    const { data, error } = await supabase
      .from('trip_reminders')
      .select('*')
      .eq('trip_id', tripId)
      .order('remind_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createReminder(reminder: Omit<TripReminder, 'id' | 'is_sent' | 'created_at'>): Promise<TripReminder> {
    const newReminder: TripReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      is_sent: false,
      created_at: new Date().toISOString(),
    };

    if (isDemoMode) {
      mockReminders.push(newReminder);
      return newReminder;
    }
    const { data, error } = await supabase
      .from('trip_reminders')
      .insert(newReminder)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockReminders.findIndex(r => r.id === reminderId);
      if (idx >= 0) mockReminders.splice(idx, 1);
      return;
    }
    await supabase.from('trip_reminders').delete().eq('id', reminderId);
  },
};

// ==========================================
// Group Safety Service
// ==========================================
export const groupSafetyService = {
  async checkGroupDistance(tripId: string, participants: GroupParticipant[]): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];
    const activeParticipants = participants.filter(p => p.status === 'accepted' && p.last_location);

    if (activeParticipants.length < 2) return alerts;

    // Calculate center point
    const centerLat = activeParticipants.reduce((sum, p) => sum + (p.last_location?.lat || 0), 0) / activeParticipants.length;
    const centerLng = activeParticipants.reduce((sum, p) => sum + (p.last_location?.lng || 0), 0) / activeParticipants.length;

    // Check each participant's distance from center
    for (const participant of activeParticipants) {
      if (!participant.last_location) continue;

      const distance = calculateDistance(
        centerLat,
        centerLng,
        participant.last_location.lat,
        participant.last_location.lng
      );

      // Alert if more than 500m from group center
      if (distance > 500) {
        alerts.push({
          id: `alert-${Date.now()}-${participant.user_id}`,
          trip_id: tripId,
          user_id: participant.user_id,
          alert_type: 'distance_warning',
          message: `${participant.profile?.full_name} is ${Math.round(distance)}m away from the group`,
          latitude: participant.last_location.lat,
          longitude: participant.last_location.lng,
          status: 'active',
          created_at: new Date().toISOString(),
        });
      }
    }

    return alerts;
  },

  async updateGroupLocations(tripId: string): Promise<LocationUpdate[]> {
    if (isDemoMode) {
      // Simulate location updates
      return mockGroupParticipants
        .filter(p => p.last_location)
        .map(p => ({
          id: `loc-${p.user_id}`,
          user_id: p.user_id,
          trip_id: tripId,
          latitude: p.last_location!.lat + (Math.random() - 0.5) * 0.001,
          longitude: p.last_location!.lng + (Math.random() - 0.5) * 0.001,
          timestamp: new Date().toISOString(),
        }));
    }
    const { data, error } = await supabase
      .from('location_updates')
      .select('*')
      .eq('trip_id', tripId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async notifyGroupPanic(tripId: string, userId: string, participants: GroupParticipant[]): Promise<void> {
    if (isDemoMode) {
      console.log('Panic alert sent to all group members');
      return;
    }
    // In production, send push notifications to all participants
    for (const participant of participants) {
      if (participant.user_id !== userId) {
        await supabase.from('notifications').insert({
          user_id: participant.user_id,
          type: 'safety_alert',
          title: 'EMERGENCY ALERT',
          message: `A group member has triggered a panic alert!`,
          data: { trip_id: tripId, alert_user_id: userId },
        });
      }
    }
  },
};

// ==========================================
// Community Service
// ==========================================
export const communityService = {
  async getBoards(): Promise<CommunityBoard[]> {
    if (isDemoMode) {
      return mockCommunityBoards;
    }
    const { data, error } = await supabase
      .from('community_boards')
      .select('*')
      .order('members_count', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBoard(boardId: string): Promise<CommunityBoard | null> {
    if (isDemoMode) {
      return mockCommunityBoards.find(b => b.id === boardId) || null;
    }
    const { data, error } = await supabase
      .from('community_boards')
      .select('*')
      .eq('id', boardId)
      .single();
    if (error) return null;
    return data;
  },

  async getPosts(boardId?: string): Promise<CommunityPost[]> {
    if (isDemoMode) {
      if (boardId) {
        return mockCommunityPosts.filter(p => p.board_id === boardId);
      }
      return mockCommunityPosts;
    }
    let query = supabase
      .from('community_posts')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getPost(postId: string): Promise<CommunityPost | null> {
    if (isDemoMode) {
      return mockCommunityPosts.find(p => p.id === postId) || null;
    }
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, author:profiles(*)')
      .eq('id', postId)
      .single();
    if (error) return null;
    return data;
  },

  async createPost(post: Omit<CommunityPost, 'id' | 'upvotes' | 'comments_count' | 'is_pinned' | 'created_at' | 'updated_at'>): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      ...post,
      id: `cp-${Date.now()}`,
      upvotes: 0,
      comments_count: 0,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: demoUserProfile,
    };

    if (isDemoMode) {
      mockCommunityPosts.unshift(newPost);
      return newPost;
    }
    const { data, error } = await supabase
      .from('community_posts')
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getComments(postId: string): Promise<CommunityComment[]> {
    if (isDemoMode) {
      return mockComments.filter(c => c.post_id === postId);
    }
    const { data, error } = await supabase
      .from('community_comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, content: string): Promise<CommunityComment> {
    const comment: CommunityComment = {
      id: `cc-${Date.now()}`,
      post_id: postId,
      user_id: 'demo-user',
      content,
      upvotes: 0,
      created_at: new Date().toISOString(),
      author: demoUserProfile,
    };

    if (isDemoMode) {
      mockComments.push(comment);
      const post = mockCommunityPosts.find(p => p.id === postId);
      if (post) post.comments_count++;
      return comment;
    }
    const { data, error } = await supabase
      .from('community_comments')
      .insert({ post_id: postId, content, user_id: 'current-user' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async upvotePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockCommunityPosts.find(p => p.id === postId);
      if (post) post.upvotes++;
      return;
    }
    await supabase.rpc('increment_post_upvotes', { post_id: postId });
  },

  async joinBoard(boardId: string): Promise<void> {
    if (isDemoMode) {
      const board = mockCommunityBoards.find(b => b.id === boardId);
      if (board) board.members_count++;
      return;
    }
    await supabase.from('board_members').insert({ board_id: boardId, user_id: 'current-user' });
  },
};

// Helper function
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
