// ==========================================
// Traveloop API Services
// ==========================================
import { supabase, isDemoMode } from '@/lib/supabase';
import type {
  Profile,
  Trip,
  Match,
  TripFilters,
  ChatRoom,
  Message,
  Rating,
  Report,
  KYCDocument,
  EmergencyContact,
  LocationUpdate,
  SafetyAlert,
  TripOTP,
  Post,
  TravelRecommendation,
  GroupTrip,
  GroupInvite,
  GroupSettings,
  GroupSafetyAlert,
  BatteryStatus,
  DistanceAlert,
  CommunityBoard,
  CommunityPost,
  CommunityReply,
  CommunityVote,
  TripReminder,
  ItineraryItem,
  ItineraryShare,
  PackingItem,
} from '@/types';
import {
  mockProfiles,
  mockTrips,
  mockMatches,
  mockChatRooms,
  mockMessages,
  mockNotifications,
  mockPosts,
  mockRecommendations,
  demoUserProfile,
} from './mockData';

// ==========================================
// Profile Services
// ==========================================
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    if (isDemoMode) {
      if (userId === 'demo-user') return demoUserProfile;
      return mockProfiles.find((p) => p.user_id === userId) || null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isDemoMode) {
      return { ...demoUserProfile, ...updates };
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    if (isDemoMode) {
      return { ...demoUserProfile, ...profile } as Profile;
    }
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async searchProfiles(query: string): Promise<Profile[]> {
    if (isDemoMode) {
      return mockProfiles.filter(
        (p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase()) ||
          p.interests.some((i) => i.toLowerCase().includes(query.toLowerCase()))
      );
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// KYC Services
// ==========================================
export const kycService = {
  async submitDocument(doc: Partial<KYCDocument>): Promise<KYCDocument> {
    if (isDemoMode) {
      return {
        id: 'kyc-demo',
        user_id: 'demo-user',
        document_type: doc.document_type || 'aadhaar',
        document_url: 'demo-url',
        status: 'pending',
        submitted_at: new Date().toISOString(),
      } as KYCDocument;
    }
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert(doc)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getDocuments(userId: string): Promise<KYCDocument[]> {
    if (isDemoMode) {
      return [
        {
          id: 'kyc-1',
          user_id: 'demo-user',
          document_type: 'aadhaar',
          document_url: 'demo-url',
          status: 'approved',
          submitted_at: '2024-06-01T10:00:00Z',
          reviewed_at: '2024-06-02T10:00:00Z',
        },
      ] as KYCDocument[];
    }
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async getVerificationStatus(userId: string): Promise<{ verified: boolean; status: string }> {
    if (isDemoMode) {
      return { verified: true, status: 'approved' };
    }
    const { data } = await supabase
      .from('kyc_documents')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .limit(1);
    return { verified: (data?.length || 0) > 0, status: data?.[0]?.status || 'none' };
  },
};

// ==========================================
// Trip Services
// ==========================================
export const tripService = {
  async getTrips(filters?: TripFilters): Promise<Trip[]> {
    if (isDemoMode) {
      let trips = [...mockTrips];
      if (filters?.destination) {
        trips = trips.filter((t) =>
          t.destination.toLowerCase().includes(filters.destination!.toLowerCase())
        );
      }
      if (filters?.travelStyle?.length) {
        trips = trips.filter((t) =>
          t.travel_style.some((s) => filters.travelStyle!.includes(s))
        );
      }
      return trips;
    }
    let query = supabase.from('trips').select('*, creator:profiles(*)');
    if (filters?.destination) {
      query = query.ilike('destination', `%${filters.destination}%`);
    }
    if (filters?.startDate) {
      query = query.gte('start_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('end_date', filters.endDate);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getTrip(tripId: string): Promise<Trip | null> {
    if (isDemoMode) {
      return mockTrips.find((t) => t.id === tripId) || null;
    }
    const { data, error } = await supabase
      .from('trips')
      .select('*, creator:profiles(*)')
      .eq('id', tripId)
      .single();
    if (error) throw error;
    return data;
  },

  async createTrip(trip: Partial<Trip>): Promise<Trip> {
    if (isDemoMode) {
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        creator_id: 'demo-user',
        title: trip.title || 'New Trip',
        destination: trip.destination || 'Unknown',
        start_date: trip.start_date || new Date().toISOString(),
        end_date: trip.end_date || new Date().toISOString(),
        budget_currency: 'INR',
        travel_style: trip.travel_style || [],
        gender_preference: trip.gender_preference || 'any',
        max_participants: trip.max_participants || 4,
        current_participants: 1,
        interests: trip.interests || [],
        status: 'open',
        is_group_trip: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: demoUserProfile,
        ...trip,
      } as Trip;
      mockTrips.unshift(newTrip);
      return newTrip;
    }
    const { data, error } = await supabase
      .from('trips')
      .insert(trip)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    if (isDemoMode) {
      const idx = mockTrips.findIndex((t) => t.id === tripId);
      if (idx >= 0) {
        mockTrips[idx] = { ...mockTrips[idx], ...updates };
        return mockTrips[idx];
      }
      throw new Error('Trip not found');
    }
    const { data, error } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', tripId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTrip(tripId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockTrips.findIndex((t) => t.id === tripId);
      if (idx >= 0) mockTrips.splice(idx, 1);
      return;
    }
    const { error } = await supabase.from('trips').delete().eq('id', tripId);
    if (error) throw error;
  },

  async getUserTrips(userId: string): Promise<Trip[]> {
    if (isDemoMode) {
      return mockTrips.filter((t) => t.creator_id === userId);
    }
    const { data, error } = await supabase
      .from('trips')
      .select('*, creator:profiles(*)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getNearbyTrips(lat: number, lng: number, radiusKm: number = 100): Promise<Trip[]> {
    if (isDemoMode) {
      return mockTrips.slice(0, 3);
    }
    // In production, use PostGIS for geo queries
    const { data, error } = await supabase
      .from('trips')
      .select('*, creator:profiles(*)')
      .eq('status', 'open')
      .limit(20);
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Matching Services
// ==========================================
export const matchService = {
  async getMatches(userId: string): Promise<Match[]> {
    if (isDemoMode) {
      return mockMatches;
    }
    const { data, error } = await supabase
      .from('matches')
      .select('*, matched_user:profiles(*), trip:trips(*)')
      .eq('user_id', userId)
      .order('compatibility_score', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async calculateMatch(tripId: string, userId: string): Promise<Match> {
    if (isDemoMode) {
      // Simulated matching algorithm
      const trip = mockTrips.find((t) => t.id === tripId);
      const user = mockProfiles.find((p) => p.user_id === userId);

      const score = {
        destination: Math.floor(Math.random() * 20) + 10,
        date_overlap: Math.floor(Math.random() * 18) + 8,
        interests: Math.floor(Math.random() * 17) + 8,
        travel_style: Math.floor(Math.random() * 15) + 5,
        safety_preference: Math.floor(Math.random() * 12) + 5,
        rating: Math.floor(Math.random() * 10) + 5,
      };

      const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

      return {
        id: `match-${Date.now()}`,
        trip_id: tripId,
        user_id: 'demo-user',
        matched_user_id: userId,
        compatibility_score: totalScore,
        score_breakdown: score,
        status: 'pending',
        created_at: new Date().toISOString(),
        matched_user: user,
        trip: trip,
      } as Match;
    }

    // Call matching edge function in production
    const { data, error } = await supabase.functions.invoke('calculate-match', {
      body: { tripId, userId },
    });
    if (error) throw error;
    return data;
  },

  async acceptMatch(matchId: string): Promise<Match> {
    if (isDemoMode) {
      const match = mockMatches.find((m) => m.id === matchId);
      if (match) {
        match.status = 'accepted';
        return match;
      }
      throw new Error('Match not found');
    }
    const { data, error } = await supabase
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async rejectMatch(matchId: string): Promise<void> {
    if (isDemoMode) {
      const match = mockMatches.find((m) => m.id === matchId);
      if (match) match.status = 'rejected';
      return;
    }
    const { error } = await supabase
      .from('matches')
      .update({ status: 'rejected' })
      .eq('id', matchId);
    if (error) throw error;
  },
};

// ==========================================
// Chat Services
// ==========================================
export const chatService = {
  async getRooms(userId: string): Promise<ChatRoom[]> {
    if (isDemoMode) {
      return mockChatRooms;
    }
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*, participants:chat_participants(*, profile:profiles(*))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getMessages(roomId: string): Promise<Message[]> {
    if (isDemoMode) {
      return mockMessages.filter((m) => m.room_id === roomId);
    }
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async sendMessage(message: Partial<Message>): Promise<Message> {
    if (isDemoMode) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        room_id: message.room_id!,
        sender_id: 'demo-user',
        content: message.content!,
        message_type: message.message_type || 'text',
        is_read: false,
        created_at: new Date().toISOString(),
      };
      mockMessages.push(newMsg);
      return newMsg;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createRoom(tripId: string, participantIds: string[]): Promise<ChatRoom> {
    if (isDemoMode) {
      const room: ChatRoom = {
        id: `room-${Date.now()}`,
        trip_id: tripId,
        type: participantIds.length > 2 ? 'group' : 'direct',
        created_at: new Date().toISOString(),
        participants: participantIds.map((id) => ({
          id: `p-${Date.now()}`,
          room_id: `room-${Date.now()}`,
          user_id: id,
          joined_at: new Date().toISOString(),
        })),
      };
      mockChatRooms.push(room);
      return room;
    }
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({ trip_id: tripId, type: participantIds.length > 2 ? 'group' : 'direct' })
      .select()
      .single();
    if (error) throw error;

    // Add participants
    await supabase.from('chat_participants').insert(
      participantIds.map((id) => ({ room_id: data.id, user_id: id }))
    );

    return data;
  },
};

// ==========================================
// OTP Services
// ==========================================
export const otpService = {
  async generateStartOTP(tripId: string, userId: string): Promise<string> {
    if (isDemoMode) {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const { data, error } = await supabase.functions.invoke('generate-otp', {
      body: { tripId, userId, type: 'start' },
    });
    if (error) throw error;
    return data.otp;
  },

  async verifyStartOTP(tripId: string, userId: string, otp: string): Promise<boolean> {
    if (isDemoMode) {
      return true; // Always verify in demo
    }
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { tripId, userId, otp, type: 'start' },
    });
    if (error) throw error;
    return data.verified;
  },

  async generateEndOTP(tripId: string, userId: string): Promise<string> {
    if (isDemoMode) {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const { data, error } = await supabase.functions.invoke('generate-otp', {
      body: { tripId, userId, type: 'end' },
    });
    if (error) throw error;
    return data.otp;
  },

  async verifyEndOTP(tripId: string, userId: string, otp: string): Promise<boolean> {
    if (isDemoMode) {
      return true;
    }
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { tripId, userId, otp, type: 'end' },
    });
    if (error) throw error;
    return data.verified;
  },
};

// ==========================================
// Location Services
// ==========================================
export const locationService = {
  async updateLocation(tripId: string, userId: string, lat: number, lng: number): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('location_updates').insert({
      trip_id: tripId,
      user_id: userId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
    });
  },

  async getGroupLocations(tripId: string): Promise<LocationUpdate[]> {
    if (isDemoMode) {
      return [
        {
          id: 'loc-1',
          user_id: '2',
          trip_id: tripId,
          latitude: 34.1526 + Math.random() * 0.01,
          longitude: 77.5771 + Math.random() * 0.01,
          timestamp: new Date().toISOString(),
        },
      ];
    }
    const { data, error } = await supabase
      .from('location_updates')
      .select('*')
      .eq('trip_id', tripId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async checkGeofence(tripId: string, lat: number, lng: number, radiusMeters: number = 100): Promise<boolean> {
    if (isDemoMode) return true;
    const { data, error } = await supabase.functions.invoke('check-geofence', {
      body: { tripId, lat, lng, radiusMeters },
    });
    if (error) throw error;
    return data.withinGeofence;
  },

  async triggerPanicAlert(tripId: string, userId: string, lat: number, lng: number): Promise<SafetyAlert> {
    if (isDemoMode) {
      return {
        id: `alert-${Date.now()}`,
        trip_id: tripId,
        user_id: userId,
        alert_type: 'panic',
        latitude: lat,
        longitude: lng,
        status: 'active',
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('safety_alerts')
      .insert({
        trip_id: tripId,
        user_id: userId,
        alert_type: 'panic',
        latitude: lat,
        longitude: lng,
        status: 'active',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==========================================
// Rating Services
// ==========================================
export const ratingService = {
  async submitRating(rating: Partial<Rating>): Promise<Rating> {
    if (isDemoMode) {
      return {
        id: `rating-${Date.now()}`,
        trip_id: rating.trip_id!,
        rater_id: 'demo-user',
        rated_user_id: rating.rated_user_id!,
        overall_rating: rating.overall_rating || 5,
        safety_rating: rating.safety_rating || 5,
        communication_rating: rating.communication_rating || 5,
        punctuality_rating: rating.punctuality_rating || 5,
        review_text: rating.review_text,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('ratings')
      .insert(rating)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserRatings(userId: string): Promise<Rating[]> {
    if (isDemoMode) {
      return [];
    }
    const { data, error } = await supabase
      .from('ratings')
      .select('*, rater:profiles(*)')
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Report & Block Services
// ==========================================
export const safetyService = {
  async reportUser(report: Partial<Report>): Promise<Report> {
    if (isDemoMode) {
      return {
        id: `report-${Date.now()}`,
        reporter_id: 'demo-user',
        reported_user_id: report.reported_user_id!,
        reason: report.reason!,
        description: report.description,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('reports')
      .insert(report)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async blockUser(blockedUserId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('blocked_users')
      .insert({ user_id: 'demo-user', blocked_user_id: blockedUserId });
  },

  async unblockUser(blockedUserId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('blocked_users')
      .delete()
      .eq('blocked_user_id', blockedUserId);
  },

  async getBlockedUsers(userId: string): Promise<string[]> {
    if (isDemoMode) return [];
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_user_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data?.map((d) => d.blocked_user_id) || [];
  },
};

// ==========================================
// Emergency Contacts Services
// ==========================================
export const emergencyService = {
  async addContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    if (isDemoMode) {
      return {
        id: `ec-${Date.now()}`,
        user_id: 'demo-user',
        name: contact.name!,
        phone: contact.phone!,
        email: contact.email,
        relationship: contact.relationship!,
        is_primary: contact.is_primary || false,
      };
    }
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert(contact)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getContacts(userId: string): Promise<EmergencyContact[]> {
    if (isDemoMode) {
      return [
        {
          id: 'ec-1',
          user_id: 'demo-user',
          name: 'Mom',
          phone: '+91 9876543210',
          relationship: 'Mother',
          is_primary: true,
        },
      ];
    }
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async removeContact(contactId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('emergency_contacts').delete().eq('id', contactId);
  },
};

// ==========================================
// Social/Posts Services (Phase 3)
// ==========================================
export const postService = {
  async getFeed(userId: string): Promise<Post[]> {
    if (isDemoMode) {
      return mockPosts;
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async createPost(post: Partial<Post>): Promise<Post> {
    if (isDemoMode) {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        user_id: 'demo-user',
        content: post.content!,
        post_type: post.post_type || 'post',
        media_urls: post.media_urls || [],
        tags: post.tags || [],
        likes_count: 0,
        comments_count: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
        author: demoUserProfile,
      };
      mockPosts.unshift(newPost);
      return newPost;
    }
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async likePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockPosts.find((p) => p.id === postId);
      if (post) post.likes_count++;
      return;
    }
    await supabase.from('post_likes').insert({ post_id: postId, user_id: 'current-user' });
  },

  async getExplorePosts(): Promise<Post[]> {
    if (isDemoMode) {
      return mockPosts.filter((p) => p.is_featured);
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .eq('is_featured', true)
      .order('likes_count', { ascending: false })
      .limit(30);
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Recommendations Services (Phase 4)
// ==========================================
export const recommendationService = {
  async getRecommendations(destination: string): Promise<TravelRecommendation[]> {
    if (isDemoMode) {
      return mockRecommendations.filter((r) =>
        r.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }
    const { data, error } = await supabase
      .from('travel_recommendations')
      .select('*')
      .ilike('destination', `%${destination}%`);
    if (error) throw error;
    return data || [];
  },

  async getAllRecommendations(): Promise<TravelRecommendation[]> {
    if (isDemoMode) {
      return mockRecommendations;
    }
    const { data, error } = await supabase
      .from('travel_recommendations')
      .select('*')
      .limit(50);
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Notification Services
// ==========================================
export const notificationService = {
  async getNotifications(userId: string) {
    if (isDemoMode) {
      return mockNotifications;
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (isDemoMode) {
      const notif = mockNotifications.find((n) => n.id === notificationId);
      if (notif) notif.is_read = true;
      return;
    }
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },
};

// ==========================================
// PHASE 2 SERVICES
// ==========================================

// ==========================================
// Group Trip Services
// ==========================================
export const groupTripService = {
  async createGroupTrip(trip: Partial<GroupTrip>): Promise<GroupTrip> {
    if (isDemoMode) {
      const newTrip: GroupTrip = {
        id: `group-${Date.now()}`,
        creator_id: 'demo-user',
        title: trip.title || 'New Group Trip',
        destination: trip.destination || 'Unknown',
        start_date: trip.start_date || new Date().toISOString(),
        end_date: trip.end_date || new Date().toISOString(),
        budget_currency: 'INR',
        travel_style: trip.travel_style || [],
        gender_preference: trip.gender_preference || 'any',
        max_participants: trip.max_participants || 10,
        current_participants: 1,
        interests: trip.interests || [],
        status: 'open',
        is_group_trip: true,
        visibility: trip.visibility || 'public',
        group_settings: trip.group_settings || {
          allow_member_invites: true,
          require_approval: true,
          max_distance_alert: 500,
          enable_location_sharing: true,
          enable_battery_alerts: true,
          low_battery_threshold: 20,
        },
        roles: [
          {
            user_id: 'demo-user',
            role: 'admin',
            permissions: ['manage_members', 'edit_trip', 'delete_messages', 'manage_itinerary', 'send_alerts', 'view_locations'],
            assigned_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: demoUserProfile,
      };
      mockTrips.unshift(newTrip);
      return newTrip;
    }
    const { data, error } = await supabase
      .from('group_trips')
      .insert(trip)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateGroupSettings(tripId: string, settings: Partial<GroupSettings>): Promise<GroupSettings> {
    if (isDemoMode) {
      return {
        allow_member_invites: true,
        require_approval: true,
        max_distance_alert: 500,
        enable_location_sharing: true,
        enable_battery_alerts: true,
        low_battery_threshold: 20,
        ...settings,
      };
    }
    const { data, error } = await supabase
      .from('group_trips')
      .update({ group_settings: settings })
      .eq('id', tripId)
      .select('group_settings')
      .single();
    if (error) throw error;
    return data.group_settings;
  },

  async inviteMember(tripId: string, inviteeData: { userId?: string; email?: string; phone?: string }): Promise<GroupInvite> {
    if (isDemoMode) {
      return {
        id: `invite-${Date.now()}`,
        trip_id: tripId,
        inviter_id: 'demo-user',
        invitee_id: inviteeData.userId,
        invitee_email: inviteeData.email,
        invitee_phone: inviteeData.phone,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('group_invites')
      .insert({
        trip_id: tripId,
        inviter_id: 'current-user',
        ...inviteeData,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async acceptInvite(inviteCode: string): Promise<void> {
    if (isDemoMode) return;
    const { error } = await supabase
      .from('group_invites')
      .update({ status: 'accepted' })
      .eq('invite_code', inviteCode);
    if (error) throw error;
  },

  async declineInvite(inviteCode: string): Promise<void> {
    if (isDemoMode) return;
    const { error } = await supabase
      .from('group_invites')
      .update({ status: 'declined' })
      .eq('invite_code', inviteCode);
    if (error) throw error;
  },

  async assignRole(tripId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('group_roles').upsert({
      trip_id: tripId,
      user_id: userId,
      role,
      assigned_at: new Date().toISOString(),
    });
  },

  async getPendingInvites(tripId: string): Promise<GroupInvite[]> {
    if (isDemoMode) {
      return [
        {
          id: 'invite-1',
          trip_id: tripId,
          inviter_id: 'demo-user',
          invitee_email: 'friend@example.com',
          invite_code: 'ABC123',
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
        },
      ];
    }
    const { data, error } = await supabase
      .from('group_invites')
      .select('*, inviter:profiles(*), invitee:profiles(*)')
      .eq('trip_id', tripId)
      .eq('status', 'pending');
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Group Safety Alerts Services
// ==========================================
export const groupSafetyService = {
  async checkDistanceAlert(tripId: string, userId: string, lat: number, lng: number): Promise<DistanceAlert | null> {
    if (isDemoMode) {
      // Simulate distance check
      const distanceFromGroup = Math.random() * 1000;
      if (distanceFromGroup > 500) {
        return {
          id: `dist-${Date.now()}`,
          trip_id: tripId,
          user_id: userId,
          distance_from_nearest: distanceFromGroup,
          distance_from_centroid: distanceFromGroup + 100,
          threshold_exceeded: true,
          nearest_member_id: '2',
          created_at: new Date().toISOString(),
        };
      }
      return null;
    }
    const { data, error } = await supabase.functions.invoke('check-distance-alert', {
      body: { tripId, userId, lat, lng },
    });
    if (error) throw error;
    return data;
  },

  async updateBatteryStatus(tripId: string, userId: string, level: number, isCharging: boolean): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('battery_status').upsert({
      trip_id: tripId,
      user_id: userId,
      level,
      is_charging: isCharging,
      last_updated: new Date().toISOString(),
    });
  },

  async getGroupBatteryStatus(tripId: string): Promise<BatteryStatus[]> {
    if (isDemoMode) {
      return [
        { user_id: 'demo-user', trip_id: tripId, level: 85, is_charging: false, last_updated: new Date().toISOString() },
        { user_id: '2', trip_id: tripId, level: 15, is_charging: false, last_updated: new Date().toISOString() },
      ];
    }
    const { data, error } = await supabase
      .from('battery_status')
      .select('*')
      .eq('trip_id', tripId);
    if (error) throw error;
    return data || [];
  },

  async sendGroupAlert(tripId: string, alert: Partial<GroupSafetyAlert>): Promise<GroupSafetyAlert> {
    if (isDemoMode) {
      return {
        id: `alert-${Date.now()}`,
        trip_id: tripId,
        user_id: 'demo-user',
        alert_type: alert.alert_type || 'distance_warning',
        status: 'active',
        affected_users: alert.affected_users || [],
        distance_from_group: alert.distance_from_group,
        battery_level: alert.battery_level,
        acknowledged_by: [],
        created_at: new Date().toISOString(),
      } as GroupSafetyAlert;
    }
    const { data, error } = await supabase
      .from('group_safety_alerts')
      .insert(alert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    if (isDemoMode) return;
    const { data: alert } = await supabase
      .from('group_safety_alerts')
      .select('acknowledged_by')
      .eq('id', alertId)
      .single();

    const acknowledged = [...(alert?.acknowledged_by || []), userId];
    await supabase
      .from('group_safety_alerts')
      .update({ acknowledged_by: acknowledged })
      .eq('id', alertId);
  },

  async getActiveAlerts(tripId: string): Promise<GroupSafetyAlert[]> {
    if (isDemoMode) {
      return [];
    }
    const { data, error } = await supabase
      .from('group_safety_alerts')
      .select('*')
      .eq('trip_id', tripId)
      .eq('status', 'active');
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Community Board Services
// ==========================================
export const communityService = {
  async getBoards(): Promise<CommunityBoard[]> {
    if (isDemoMode) {
      return [
        { id: 'board-1', name: 'Himalayas Travelers', description: 'Share tips about Himalayan treks', category: 'trekking', members_count: 1250, created_at: new Date().toISOString() },
        { id: 'board-2', name: 'Budget Backpackers India', description: 'Travel India on a budget', category: 'budget', members_count: 3400, created_at: new Date().toISOString() },
        { id: 'board-3', name: 'Solo Women Travelers', description: 'Safe travel tips for women', category: 'safety', members_count: 2100, created_at: new Date().toISOString() },
        { id: 'board-4', name: 'Food Explorers', description: 'Best local food recommendations', category: 'food', members_count: 1800, created_at: new Date().toISOString() },
      ];
    }
    const { data, error } = await supabase
      .from('community_boards')
      .select('*')
      .order('members_count', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getBoardPosts(boardId: string): Promise<CommunityPost[]> {
    if (isDemoMode) {
      return [
        {
          id: 'post-1',
          board_id: boardId,
          author_id: '2',
          title: 'Best time to visit Ladakh?',
          content: 'Planning a trip to Ladakh next month. What\'s the best time to visit? Any recommendations for itinerary?',
          category: 'question',
          tags: ['ladakh', 'planning', 'weather'],
          upvotes: 24,
          downvotes: 2,
          replies_count: 8,
          is_pinned: false,
          is_locked: false,
          is_moderated: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          author: mockProfiles[0],
        },
        {
          id: 'post-2',
          board_id: boardId,
          author_id: '3',
          title: 'Essential packing list for mountain treks',
          content: 'After 15+ treks, here\'s my ultimate packing list: 1. Good quality trekking shoes 2. Layered clothing 3. First aid kit 4. Sunscreen & sunglasses 5. Power bank...',
          category: 'tip',
          tags: ['packing', 'trekking', 'essentials'],
          upvotes: 156,
          downvotes: 5,
          replies_count: 32,
          is_pinned: true,
          is_locked: false,
          is_moderated: false,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          author: mockProfiles[1],
        },
      ];
    }
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, author:profiles(*)')
      .eq('board_id', boardId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createPost(post: Partial<CommunityPost>): Promise<CommunityPost> {
    if (isDemoMode) {
      return {
        id: `post-${Date.now()}`,
        board_id: post.board_id!,
        author_id: 'demo-user',
        title: post.title!,
        content: post.content!,
        category: post.category || 'discussion',
        tags: post.tags || [],
        upvotes: 0,
        downvotes: 0,
        replies_count: 0,
        is_pinned: false,
        is_locked: false,
        is_moderated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: demoUserProfile,
      };
    }
    const { data, error } = await supabase
      .from('community_posts')
      .insert(post)
      .select('*, author:profiles(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async getPostReplies(postId: string): Promise<CommunityReply[]> {
    if (isDemoMode) {
      return [
        {
          id: 'reply-1',
          post_id: postId,
          author_id: '4',
          content: 'June to September is the best time! The roads are clear and weather is pleasant.',
          upvotes: 12,
          downvotes: 0,
          is_accepted: true,
          is_moderated: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          author: mockProfiles[2],
        },
      ];
    }
    const { data, error } = await supabase
      .from('community_replies')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('upvotes', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createReply(reply: Partial<CommunityReply>): Promise<CommunityReply> {
    if (isDemoMode) {
      return {
        id: `reply-${Date.now()}`,
        post_id: reply.post_id!,
        author_id: 'demo-user',
        content: reply.content!,
        upvotes: 0,
        downvotes: 0,
        is_accepted: false,
        is_moderated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: demoUserProfile,
      };
    }
    const { data, error } = await supabase
      .from('community_replies')
      .insert(reply)
      .select('*, author:profiles(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async vote(targetId: string, targetType: 'post' | 'reply', voteType: 'up' | 'down'): Promise<void> {
    if (isDemoMode) return;

    // Remove existing vote
    await supabase
      .from('community_votes')
      .delete()
      .eq('user_id', 'current-user')
      .eq('target_id', targetId);

    // Add new vote
    await supabase.from('community_votes').insert({
      user_id: 'current-user',
      target_id: targetId,
      target_type: targetType,
      vote_type: voteType,
    });
  },

  async reportPost(postId: string, reason: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('community_reports').insert({
      post_id: postId,
      reporter_id: 'current-user',
      reason,
    });
  },
};

// ==========================================
// Itinerary & Reminders Services
// ==========================================
export const itineraryService = {
  async getItinerary(tripId: string): Promise<ItineraryItem[]> {
    if (isDemoMode) {
      return [
        {
          id: 'item-1',
          trip_id: tripId,
          day_number: 1,
          date: new Date().toISOString(),
          title: 'Arrival in Leh',
          description: 'Arrive at Leh airport and transfer to hotel. Rest for acclimatization.',
          location_name: 'Leh Airport',
          start_time: '10:00',
          end_time: '12:00',
          category: 'transport',
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'item-2',
          trip_id: tripId,
          day_number: 1,
          date: new Date().toISOString(),
          title: 'Check-in at Hotel',
          description: 'Check-in at The Grand Dragon Ladakh',
          location_name: 'The Grand Dragon Ladakh',
          start_time: '12:30',
          end_time: '13:00',
          category: 'accommodation',
          booking_reference: 'GDL-2024-1234',
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'item-3',
          trip_id: tripId,
          day_number: 1,
          date: new Date().toISOString(),
          title: 'Lunch at local restaurant',
          description: 'Try traditional Ladakhi cuisine',
          location_name: 'Bon Appetit Restaurant',
          start_time: '13:30',
          end_time: '14:30',
          category: 'food',
          cost_estimate: 500,
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number')
      .order('start_time');
    if (error) throw error;
    return data || [];
  },

  async addItineraryItem(item: Partial<ItineraryItem>): Promise<ItineraryItem> {
    if (isDemoMode) {
      return {
        id: `item-${Date.now()}`,
        trip_id: item.trip_id!,
        day_number: item.day_number || 1,
        date: item.date || new Date().toISOString(),
        title: item.title!,
        description: item.description,
        location_name: item.location_name,
        start_time: item.start_time,
        end_time: item.end_time,
        category: item.category || 'activity',
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateItineraryItem(itemId: string, updates: Partial<ItineraryItem>): Promise<ItineraryItem> {
    if (isDemoMode) {
      return { ...updates, id: itemId } as ItineraryItem;
    }
    const { data, error } = await supabase
      .from('itinerary_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteItineraryItem(itemId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('itinerary_items').delete().eq('id', itemId);
  },

  async shareItinerary(tripId: string, shareData: Partial<ItineraryShare>): Promise<ItineraryShare> {
    if (isDemoMode) {
      return {
        id: `share-${Date.now()}`,
        trip_id: tripId,
        shared_by: 'demo-user',
        share_type: shareData.share_type || 'link',
        share_url: `https://Traveloop.com/itinerary/${tripId}/${Math.random().toString(36).substring(7)}`,
        permissions: shareData.permissions || 'view',
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('itinerary_shares')
      .insert({ ...shareData, trip_id: tripId, shared_by: 'current-user' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==========================================
// Trip Reminders Services
// ==========================================
export const reminderService = {
  async getReminders(tripId: string): Promise<TripReminder[]> {
    if (isDemoMode) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() + 7);
      return [
        {
          id: 'rem-1',
          trip_id: tripId,
          user_id: 'demo-user',
          title: 'Book flight tickets',
          description: 'Book return flights to Leh',
          reminder_type: 'booking',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          notification_sent: false,
          notify_before_minutes: 1440,
          created_at: new Date().toISOString(),
        },
        {
          id: 'rem-2',
          trip_id: tripId,
          user_id: 'demo-user',
          title: 'Pack winter clothes',
          description: 'Don\'t forget thermals and jackets',
          reminder_type: 'packing',
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          is_completed: false,
          notification_sent: false,
          notify_before_minutes: 2880,
          created_at: new Date().toISOString(),
        },
        {
          id: 'rem-3',
          trip_id: tripId,
          user_id: 'demo-user',
          title: 'Download offline maps',
          description: 'Download Ladakh maps for offline use',
          reminder_type: 'custom',
          due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          is_completed: true,
          notification_sent: true,
          notify_before_minutes: 1440,
          created_at: new Date().toISOString(),
        },
      ];
    }
    const { data, error } = await supabase
      .from('trip_reminders')
      .select('*')
      .eq('trip_id', tripId)
      .order('due_date');
    if (error) throw error;
    return data || [];
  },

  async createReminder(reminder: Partial<TripReminder>): Promise<TripReminder> {
    if (isDemoMode) {
      return {
        id: `rem-${Date.now()}`,
        trip_id: reminder.trip_id!,
        user_id: 'demo-user',
        title: reminder.title!,
        description: reminder.description,
        reminder_type: reminder.reminder_type || 'custom',
        due_date: reminder.due_date!,
        due_time: reminder.due_time,
        is_completed: false,
        notification_sent: false,
        notify_before_minutes: reminder.notify_before_minutes || 60,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('trip_reminders')
      .insert(reminder)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateReminder(reminderId: string, updates: Partial<TripReminder>): Promise<TripReminder> {
    if (isDemoMode) {
      return { ...updates, id: reminderId } as TripReminder;
    }
    const { data, error } = await supabase
      .from('trip_reminders')
      .update(updates)
      .eq('id', reminderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markComplete(reminderId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('trip_reminders')
      .update({ is_completed: true })
      .eq('id', reminderId);
  },

  async deleteReminder(reminderId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('trip_reminders').delete().eq('id', reminderId);
  },
};

// ==========================================
// Packing List Services
// ==========================================
export const packingService = {
  async getPackingList(tripId: string): Promise<PackingItem[]> {
    if (isDemoMode) {
      return [
        { id: 'pack-1', trip_id: tripId, user_id: 'demo-user', item_name: 'Passport', category: 'documents', quantity: 1, is_packed: true, is_shared: false, created_at: new Date().toISOString() },
        { id: 'pack-2', trip_id: tripId, user_id: 'demo-user', item_name: 'Winter Jacket', category: 'clothing', quantity: 1, is_packed: false, is_shared: false, created_at: new Date().toISOString() },
        { id: 'pack-3', trip_id: tripId, user_id: 'demo-user', item_name: 'Sunscreen', category: 'toiletries', quantity: 1, is_packed: false, is_shared: true, created_at: new Date().toISOString() },
        { id: 'pack-4', trip_id: tripId, user_id: 'demo-user', item_name: 'Power Bank', category: 'electronics', quantity: 1, is_packed: true, is_shared: true, created_at: new Date().toISOString() },
        { id: 'pack-5', trip_id: tripId, user_id: 'demo-user', item_name: 'First Aid Kit', category: 'medicine', quantity: 1, is_packed: false, is_shared: true, created_at: new Date().toISOString() },
      ];
    }
    const { data, error } = await supabase
      .from('packing_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('category');
    if (error) throw error;
    return data || [];
  },

  async addItem(item: Partial<PackingItem>): Promise<PackingItem> {
    if (isDemoMode) {
      return {
        id: `pack-${Date.now()}`,
        trip_id: item.trip_id!,
        user_id: 'demo-user',
        item_name: item.item_name!,
        category: item.category || 'other',
        quantity: item.quantity || 1,
        is_packed: false,
        is_shared: item.is_shared || false,
        created_at: new Date().toISOString(),
      };
    }
    const { data, error } = await supabase
      .from('packing_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async togglePacked(itemId: string, isPacked: boolean): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('packing_items')
      .update({ is_packed: isPacked })
      .eq('id', itemId);
  },

  async deleteItem(itemId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('packing_items').delete().eq('id', itemId);
  },
};

// ==========================================
// PHASE 3 SERVICES - Content Platform
// ==========================================

import type {
  TravelVlog,
  VlogComment,
  VlogUploadProgress,
  TravelStory,
  StoryRing,
  StoryViewer,
  LocationTag,
  NearbyLocation,
  PopularLocation,
  ExperiencePost,
  PostComment,
  PostBookmark,
  BookmarkCollection,
  Hashtag,
  ExploreFeedItem,
  ExploreFilters,
  TrendingSection,
  FollowRelation,
  FollowRequest,
  FollowStats,
  FollowSuggestion,
  ActivityItem,
} from '@/types';

// Mock data for Phase-3
const mockVlogs: TravelVlog[] = [
  {
    id: 'vlog-1',
    user_id: '2',
    title: 'Sunrise at Pangong Lake',
    description: 'Witnessing the magical sunrise at Pangong Tso! The colors are unreal 🌅',
    video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400',
    duration_seconds: 28,
    file_size_bytes: 15000000,
    resolution: '1080p',
    processing_status: 'ready',
    hashtags: ['pangong', 'ladakh', 'sunrise', 'travel'],
    views_count: 12500,
    likes_count: 890,
    comments_count: 45,
    shares_count: 120,
    is_featured: true,
    is_public: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vlog-2',
    user_id: '3',
    title: 'Street Food in Jaipur',
    description: 'The best dal baati churma you\'ll ever taste! Must try when in Rajasthan',
    video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400',
    duration_seconds: 25,
    file_size_bytes: 12000000,
    resolution: '1080p',
    processing_status: 'ready',
    hashtags: ['jaipur', 'streetfood', 'rajasthan', 'foodie'],
    views_count: 8900,
    likes_count: 650,
    comments_count: 32,
    shares_count: 85,
    is_featured: true,
    is_public: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'vlog-3',
    user_id: '4',
    title: 'Backwaters of Kerala',
    description: 'Peaceful houseboat ride through Kerala backwaters 🛶',
    video_url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400',
    duration_seconds: 30,
    file_size_bytes: 18000000,
    resolution: '1080p',
    processing_status: 'ready',
    hashtags: ['kerala', 'backwaters', 'houseboat', 'serene'],
    views_count: 15600,
    likes_count: 1200,
    comments_count: 78,
    shares_count: 200,
    is_featured: true,
    is_public: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockStories: TravelStory[] = [
  {
    id: 'story-1',
    user_id: '2',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    caption: 'Adventure awaits! 🏔️',
    hashtags: ['mountains', 'adventure'],
    text_overlays: [],
    stickers: [],
    views_count: 234,
    reactions: [{ emoji: '❤️', user_ids: ['3', '4'], count: 2 }],
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    is_seen: false,
  },
  {
    id: 'story-2',
    user_id: '2',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    caption: 'The view from the top!',
    hashtags: ['summit', 'hiking'],
    text_overlays: [],
    stickers: [],
    views_count: 189,
    reactions: [{ emoji: '🔥', user_ids: ['5'], count: 1 }],
    expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    is_seen: false,
  },
  {
    id: 'story-3',
    user_id: '3',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    caption: 'Beach vibes 🏖️',
    hashtags: ['beach', 'goa'],
    text_overlays: [],
    stickers: [],
    views_count: 456,
    reactions: [{ emoji: '😍', user_ids: ['2', '4', '5'], count: 3 }],
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    is_seen: true,
  },
];

const mockExperiencePosts: ExperiencePost[] = [
  {
    id: 'exp-1',
    user_id: '2',
    content: 'Just completed the Hampta Pass trek! 5 days of pure adventure through snow, meadows, and stunning mountain views. Pro tip: Carry enough warm layers, the nights get really cold at Shea Goru camp. The crossing from Kullu to Lahaul valley is absolutely breathtaking! 🏔️❄️',
    post_type: 'experience',
    media_urls: [
      'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    ],
    media_types: ['image', 'image'],
    hashtags: ['hamptapass', 'trekking', 'himachal', 'adventure'],
    mentions: [],
    likes_count: 342,
    comments_count: 28,
    shares_count: 45,
    saves_count: 89,
    is_featured: true,
    is_public: true,
    edit_history: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    user_id: '3',
    content: 'Hidden gem alert! 💎 Found this amazing cafe in Pondicherry - Villa Shanti. The French colonial architecture is stunning, and their croissants are to die for. Perfect for a quiet breakfast after exploring the French Quarter.',
    post_type: 'recommendation',
    media_urls: ['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
    media_types: ['image'],
    hashtags: ['pondicherry', 'cafe', 'hiddengen', 'foodie'],
    mentions: [],
    rating: 5,
    price_range: '$$',
    likes_count: 567,
    comments_count: 42,
    shares_count: 78,
    saves_count: 156,
    is_featured: true,
    is_public: true,
    edit_history: [],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    user_id: '4',
    content: 'TIP: If you\'re planning to visit Varanasi, try to catch the evening Ganga Aarti at Dashashwamedh Ghat. Arrive at least 1 hour early to get a good spot on the steps. The boat view is also amazing but costs around ₹200-300 per person.',
    post_type: 'tip',
    media_urls: ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800'],
    media_types: ['image'],
    hashtags: ['varanasi', 'gangaaarti', 'travel', 'spirituality'],
    mentions: [],
    likes_count: 892,
    comments_count: 65,
    shares_count: 120,
    saves_count: 234,
    is_featured: false,
    is_public: true,
    edit_history: [],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockLocations: LocationTag[] = [
  { id: 'loc-1', name: 'Ladakh', city: 'Leh', country: 'India', country_code: 'IN', latitude: 34.1526, longitude: 77.5771, category: 'city', posts_count: 1250, vlogs_count: 89, stories_count: 456, is_verified: true },
  { id: 'loc-2', name: 'Goa', city: 'Panaji', country: 'India', country_code: 'IN', latitude: 15.4909, longitude: 73.8278, category: 'beach', posts_count: 3400, vlogs_count: 234, stories_count: 890, is_verified: true },
  { id: 'loc-3', name: 'Jaipur', city: 'Jaipur', country: 'India', country_code: 'IN', latitude: 26.9124, longitude: 75.7873, category: 'city', posts_count: 2100, vlogs_count: 156, stories_count: 567, is_verified: true },
  { id: 'loc-4', name: 'Manali', city: 'Manali', country: 'India', country_code: 'IN', latitude: 32.2396, longitude: 77.1887, category: 'mountain', posts_count: 1800, vlogs_count: 120, stories_count: 345, is_verified: true },
  { id: 'loc-5', name: 'Kerala Backwaters', city: 'Alleppey', country: 'India', country_code: 'IN', latitude: 9.4981, longitude: 76.3388, category: 'nature', posts_count: 1500, vlogs_count: 98, stories_count: 289, is_verified: true },
];

const mockHashtags: Hashtag[] = [
  { id: 'tag-1', tag: 'wanderlust', posts_count: 15000, vlogs_count: 890, stories_count: 2300, trending_score: 95, is_trending: true, created_at: new Date().toISOString() },
  { id: 'tag-2', tag: 'incredibleindia', posts_count: 12000, vlogs_count: 670, stories_count: 1800, trending_score: 88, is_trending: true, created_at: new Date().toISOString() },
  { id: 'tag-3', tag: 'solotravel', posts_count: 8500, vlogs_count: 450, stories_count: 1200, trending_score: 82, is_trending: true, created_at: new Date().toISOString() },
  { id: 'tag-4', tag: 'trekking', posts_count: 7200, vlogs_count: 380, stories_count: 950, trending_score: 75, is_trending: false, created_at: new Date().toISOString() },
  { id: 'tag-5', tag: 'backpacking', posts_count: 6800, vlogs_count: 320, stories_count: 890, trending_score: 70, is_trending: false, created_at: new Date().toISOString() },
];

// ==========================================
// Travel Vlogs Services
// ==========================================
export const vlogService = {
  async getVlogs(page: number = 1, limit: number = 10): Promise<TravelVlog[]> {
    if (isDemoMode) {
      return mockVlogs.map(v => ({ ...v, author: mockProfiles.find(p => p.user_id === v.user_id) }));
    }
    const { data, error } = await supabase
      .from('travel_vlogs')
      .select('*, author:profiles(*)')
      .eq('is_public', true)
      .eq('processing_status', 'ready')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return data || [];
  },

  async getVlog(vlogId: string): Promise<TravelVlog | null> {
    if (isDemoMode) {
      const vlog = mockVlogs.find(v => v.id === vlogId);
      if (vlog) return { ...vlog, author: mockProfiles.find(p => p.user_id === vlog.user_id) };
      return null;
    }
    const { data, error } = await supabase
      .from('travel_vlogs')
      .select('*, author:profiles(*)')
      .eq('id', vlogId)
      .single();
    if (error) throw error;
    return data;
  },

  async uploadVlog(file: File, metadata: Partial<TravelVlog>): Promise<VlogUploadProgress> {
    if (isDemoMode) {
      return {
        id: `upload-${Date.now()}`,
        file_name: file.name,
        total_bytes: file.size,
        uploaded_bytes: 0,
        progress_percent: 0,
        status: 'uploading',
      };
    }
    // In production, upload to Supabase Storage
    const fileName = `vlogs/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('videos').upload(fileName, file);
    if (error) throw error;

    return {
      id: `upload-${Date.now()}`,
      file_name: file.name,
      total_bytes: file.size,
      uploaded_bytes: file.size,
      progress_percent: 100,
      status: 'processing',
    };
  },

  async createVlog(vlog: Partial<TravelVlog>): Promise<TravelVlog> {
    if (isDemoMode) {
      const newVlog: TravelVlog = {
        id: `vlog-${Date.now()}`,
        user_id: 'demo-user',
        title: vlog.title || 'New Vlog',
        video_url: vlog.video_url || '',
        thumbnail_url: vlog.thumbnail_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        duration_seconds: vlog.duration_seconds || 30,
        file_size_bytes: vlog.file_size_bytes || 10000000,
        resolution: '1080p',
        processing_status: 'ready',
        hashtags: vlog.hashtags || [],
        views_count: 0,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_featured: false,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: demoUserProfile,
      };
      mockVlogs.unshift(newVlog);
      return newVlog;
    }
    const { data, error } = await supabase
      .from('travel_vlogs')
      .insert(vlog)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async likeVlog(vlogId: string): Promise<void> {
    if (isDemoMode) {
      const vlog = mockVlogs.find(v => v.id === vlogId);
      if (vlog) vlog.likes_count++;
      return;
    }
    await supabase.from('vlog_likes').insert({ vlog_id: vlogId, user_id: 'current-user' });
  },

  async getVlogComments(vlogId: string): Promise<VlogComment[]> {
    if (isDemoMode) {
      return [
        { id: 'vc-1', vlog_id: vlogId, user_id: '3', content: 'Amazing view! Where exactly is this?', likes_count: 5, replies_count: 1, created_at: new Date().toISOString(), author: mockProfiles[1] },
        { id: 'vc-2', vlog_id: vlogId, user_id: '4', content: 'Adding this to my bucket list! 🙌', likes_count: 3, replies_count: 0, created_at: new Date().toISOString(), author: mockProfiles[2] },
      ];
    }
    const { data, error } = await supabase
      .from('vlog_comments')
      .select('*, author:profiles(*)')
      .eq('vlog_id', vlogId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async addVlogComment(vlogId: string, content: string): Promise<VlogComment> {
    if (isDemoMode) {
      return {
        id: `vc-${Date.now()}`,
        vlog_id: vlogId,
        user_id: 'demo-user',
        content,
        likes_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        author: demoUserProfile,
      };
    }
    const { data, error } = await supabase
      .from('vlog_comments')
      .insert({ vlog_id: vlogId, user_id: 'current-user', content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getFeaturedVlogs(): Promise<TravelVlog[]> {
    if (isDemoMode) {
      return mockVlogs.filter(v => v.is_featured).map(v => ({ ...v, author: mockProfiles.find(p => p.user_id === v.user_id) }));
    }
    const { data, error } = await supabase
      .from('travel_vlogs')
      .select('*, author:profiles(*)')
      .eq('is_featured', true)
      .order('views_count', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async incrementViews(vlogId: string): Promise<void> {
    if (isDemoMode) {
      const vlog = mockVlogs.find(v => v.id === vlogId);
      if (vlog) vlog.views_count++;
      return;
    }
    await supabase.rpc('increment_vlog_views', { vlog_id: vlogId });
  },
};

// ==========================================
// Travel Stories Services
// ==========================================
export const storyService = {
  async getStoryRings(): Promise<StoryRing[]> {
    if (isDemoMode) {
      const userStories = mockStories.reduce((acc, story) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = { count: 0, latest: story.created_at, hasUnseen: false };
        }
        acc[story.user_id].count++;
        if (!story.is_seen) acc[story.user_id].hasUnseen = true;
        if (new Date(story.created_at) > new Date(acc[story.user_id].latest)) {
          acc[story.user_id].latest = story.created_at;
        }
        return acc;
      }, {} as Record<string, { count: number; latest: string; hasUnseen: boolean }>);

      return Object.entries(userStories).map(([userId, data]) => ({
        user_id: userId,
        has_unseen: data.hasUnseen,
        stories_count: data.count,
        latest_story_at: data.latest,
        profile: mockProfiles.find(p => p.user_id === userId),
      }));
    }
    const { data, error } = await supabase
      .from('story_rings')
      .select('*, profile:profiles(*)')
      .gt('expires_at', new Date().toISOString());
    if (error) throw error;
    return data || [];
  },

  async getUserStories(userId: string): Promise<TravelStory[]> {
    if (isDemoMode) {
      return mockStories
        .filter(s => s.user_id === userId && new Date(s.expires_at) > new Date())
        .map(s => ({ ...s, author: mockProfiles.find(p => p.user_id === s.user_id) }));
    }
    const { data, error } = await supabase
      .from('travel_stories')
      .select('*, author:profiles(*)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createStory(story: Partial<TravelStory>): Promise<TravelStory> {
    if (isDemoMode) {
      const newStory: TravelStory = {
        id: `story-${Date.now()}`,
        user_id: 'demo-user',
        media_type: story.media_type || 'image',
        media_url: story.media_url || '',
        caption: story.caption,
        hashtags: story.hashtags || [],
        text_overlays: story.text_overlays || [],
        stickers: story.stickers || [],
        views_count: 0,
        reactions: [],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        author: demoUserProfile,
      };
      mockStories.unshift(newStory);
      return newStory;
    }
    const { data, error } = await supabase
      .from('travel_stories')
      .insert({
        ...story,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async viewStory(storyId: string): Promise<void> {
    if (isDemoMode) {
      const story = mockStories.find(s => s.id === storyId);
      if (story) {
        story.views_count++;
        story.is_seen = true;
      }
      return;
    }
    await supabase.from('story_views').insert({ story_id: storyId, user_id: 'current-user' });
  },

  async reactToStory(storyId: string, emoji: string): Promise<void> {
    if (isDemoMode) {
      const story = mockStories.find(s => s.id === storyId);
      if (story) {
        const reaction = story.reactions.find(r => r.emoji === emoji);
        if (reaction) {
          reaction.count++;
          reaction.user_ids.push('demo-user');
        } else {
          story.reactions.push({ emoji, user_ids: ['demo-user'], count: 1 });
        }
      }
      return;
    }
    await supabase.from('story_reactions').insert({ story_id: storyId, user_id: 'current-user', emoji });
  },

  async getStoryViewers(storyId: string): Promise<StoryViewer[]> {
    if (isDemoMode) {
      return [
        { user_id: '3', viewed_at: new Date().toISOString(), profile: mockProfiles[1] },
        { user_id: '4', viewed_at: new Date().toISOString(), reaction: '❤️', profile: mockProfiles[2] },
      ];
    }
    const { data, error } = await supabase
      .from('story_views')
      .select('*, profile:profiles(*)')
      .eq('story_id', storyId);
    if (error) throw error;
    return data || [];
  },

  async deleteStory(storyId: string): Promise<void> {
    if (isDemoMode) {
      const idx = mockStories.findIndex(s => s.id === storyId);
      if (idx >= 0) mockStories.splice(idx, 1);
      return;
    }
    await supabase.from('travel_stories').delete().eq('id', storyId);
  },
};

// ==========================================
// Location Tagging Services
// ==========================================
export const locationTagService = {
  async searchLocations(query: string): Promise<LocationTag[]> {
    if (isDemoMode) {
      return mockLocations.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.city?.toLowerCase().includes(query.toLowerCase())
      );
    }
    const { data, error } = await supabase
      .from('location_tags')
      .select('*')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async getNearbyLocations(lat: number, lng: number, radiusKm: number = 50): Promise<NearbyLocation[]> {
    if (isDemoMode) {
      return mockLocations.slice(0, 3).map(loc => ({
        location_tag: loc,
        distance_meters: Math.random() * radiusKm * 1000,
      }));
    }
    // In production, use PostGIS for geo queries
    const { data, error } = await supabase.rpc('get_nearby_locations', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
    });
    if (error) throw error;
    return data || [];
  },

  async getPopularLocations(): Promise<PopularLocation[]> {
    if (isDemoMode) {
      return mockLocations.map(loc => ({
        location_tag: loc,
        trending_score: Math.random() * 100,
        recent_posts_count: Math.floor(Math.random() * 500),
      }));
    }
    const { data, error } = await supabase
      .from('location_tags')
      .select('*')
      .order('posts_count', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data?.map(loc => ({ location_tag: loc, trending_score: 0, recent_posts_count: loc.posts_count })) || [];
  },

  async getLocationPosts(locationId: string): Promise<ExperiencePost[]> {
    if (isDemoMode) {
      return mockExperiencePosts.slice(0, 2).map(p => ({ ...p, author: mockProfiles.find(pr => pr.user_id === p.user_id) }));
    }
    const { data, error } = await supabase
      .from('experience_posts')
      .select('*, author:profiles(*)')
      .eq('location_tag.id', locationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async reverseGeocode(lat: number, lng: number): Promise<LocationTag | null> {
    if (isDemoMode) {
      return mockLocations[0];
    }
    // In production, use external geocoding API
    const { data, error } = await supabase.functions.invoke('reverse-geocode', {
      body: { lat, lng },
    });
    if (error) throw error;
    return data;
  },

  async createLocationTag(location: Partial<LocationTag>): Promise<LocationTag> {
    if (isDemoMode) {
      const newLoc: LocationTag = {
        id: `loc-${Date.now()}`,
        name: location.name || 'New Location',
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        posts_count: 0,
        vlogs_count: 0,
        stories_count: 0,
        is_verified: false,
        ...location,
      };
      mockLocations.push(newLoc);
      return newLoc;
    }
    const { data, error } = await supabase
      .from('location_tags')
      .insert(location)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ==========================================
// Experience Posts Services
// ==========================================
export const experiencePostService = {
  async getFeed(page: number = 1, limit: number = 20): Promise<ExperiencePost[]> {
    if (isDemoMode) {
      return mockExperiencePosts.map(p => ({ ...p, author: mockProfiles.find(pr => pr.user_id === p.user_id) }));
    }
    const { data, error } = await supabase
      .from('experience_posts')
      .select('*, author:profiles(*), location_tag:location_tags(*)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return data || [];
  },

  async getPost(postId: string): Promise<ExperiencePost | null> {
    if (isDemoMode) {
      const post = mockExperiencePosts.find(p => p.id === postId);
      if (post) return { ...post, author: mockProfiles.find(pr => pr.user_id === post.user_id) };
      return null;
    }
    const { data, error } = await supabase
      .from('experience_posts')
      .select('*, author:profiles(*), location_tag:location_tags(*)')
      .eq('id', postId)
      .single();
    if (error) throw error;
    return data;
  },

  async createPost(post: Partial<ExperiencePost>): Promise<ExperiencePost> {
    if (isDemoMode) {
      const newPost: ExperiencePost = {
        id: `exp-${Date.now()}`,
        user_id: 'demo-user',
        content: post.content || '',
        post_type: post.post_type || 'experience',
        media_urls: post.media_urls || [],
        media_types: post.media_types || [],
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        saves_count: 0,
        is_featured: false,
        is_public: true,
        edit_history: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: demoUserProfile,
      };
      mockExperiencePosts.unshift(newPost);
      return newPost;
    }
    const { data, error } = await supabase
      .from('experience_posts')
      .insert(post)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async likePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockExperiencePosts.find(p => p.id === postId);
      if (post) {
        post.likes_count++;
        post.is_liked = true;
      }
      return;
    }
    await supabase.from('post_likes').insert({ post_id: postId, user_id: 'current-user' });
  },

  async unlikePost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockExperiencePosts.find(p => p.id === postId);
      if (post) {
        post.likes_count--;
        post.is_liked = false;
      }
      return;
    }
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', 'current-user');
  },

  async bookmarkPost(postId: string): Promise<void> {
    if (isDemoMode) {
      const post = mockExperiencePosts.find(p => p.id === postId);
      if (post) {
        post.saves_count++;
        post.is_bookmarked = true;
      }
      return;
    }
    await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: 'current-user' });
  },

  async getComments(postId: string): Promise<PostComment[]> {
    if (isDemoMode) {
      return [
        { id: 'pc-1', post_id: postId, user_id: '3', content: 'This is so inspiring! Adding to my list 🙌', likes_count: 8, replies_count: 2, created_at: new Date().toISOString(), author: mockProfiles[1] },
        { id: 'pc-2', post_id: postId, user_id: '4', content: 'How long did this trek take?', likes_count: 2, replies_count: 1, created_at: new Date().toISOString(), author: mockProfiles[2] },
      ];
    }
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:profiles(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, content: string): Promise<PostComment> {
    if (isDemoMode) {
      return {
        id: `pc-${Date.now()}`,
        post_id: postId,
        user_id: 'demo-user',
        content,
        likes_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        author: demoUserProfile,
      };
    }
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: 'current-user', content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBookmarks(): Promise<PostBookmark[]> {
    if (isDemoMode) {
      return mockExperiencePosts.slice(0, 2).map(p => ({
        id: `bm-${p.id}`,
        user_id: 'demo-user',
        post_id: p.id,
        created_at: new Date().toISOString(),
        post: { ...p, author: mockProfiles.find(pr => pr.user_id === p.user_id) },
      }));
    }
    const { data, error } = await supabase
      .from('post_bookmarks')
      .select('*, post:experience_posts(*, author:profiles(*))')
      .eq('user_id', 'current-user');
    if (error) throw error;
    return data || [];
  },

  async searchByHashtag(hashtag: string): Promise<ExperiencePost[]> {
    if (isDemoMode) {
      return mockExperiencePosts.filter(p => p.hashtags.includes(hashtag.replace('#', '')));
    }
    const { data, error } = await supabase
      .from('experience_posts')
      .select('*, author:profiles(*)')
      .contains('hashtags', [hashtag.replace('#', '')])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

// ==========================================
// Hashtag Services
// ==========================================
export const hashtagService = {
  async getTrending(): Promise<Hashtag[]> {
    if (isDemoMode) {
      return mockHashtags.filter(h => h.is_trending);
    }
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .eq('is_trending', true)
      .order('trending_score', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<Hashtag[]> {
    if (isDemoMode) {
      return mockHashtags.filter(h => h.tag.includes(query.toLowerCase()));
    }
    const { data, error } = await supabase
      .from('hashtags')
      .select('*')
      .ilike('tag', `%${query}%`)
      .limit(10);
    if (error) throw error;
    return data || [];
  },

  async getHashtagContent(tag: string): Promise<{ posts: ExperiencePost[]; vlogs: TravelVlog[] }> {
    if (isDemoMode) {
      return {
        posts: mockExperiencePosts.filter(p => p.hashtags.includes(tag)),
        vlogs: mockVlogs.filter(v => v.hashtags.includes(tag)),
      };
    }
    const [postsRes, vlogsRes] = await Promise.all([
      supabase.from('experience_posts').select('*, author:profiles(*)').contains('hashtags', [tag]),
      supabase.from('travel_vlogs').select('*, author:profiles(*)').contains('hashtags', [tag]),
    ]);
    return {
      posts: postsRes.data || [],
      vlogs: vlogsRes.data || [],
    };
  },
};

// ==========================================
// Explore Feed Services
// ==========================================
export const exploreService = {
  async getFeed(filters?: ExploreFilters, page: number = 1): Promise<ExploreFeedItem[]> {
    if (isDemoMode) {
      const items: ExploreFeedItem[] = [];

      // Add posts
      mockExperiencePosts.forEach(p => {
        items.push({
          id: `feed-${p.id}`,
          type: 'post',
          content: { ...p, author: mockProfiles.find(pr => pr.user_id === p.user_id) },
          relevance_score: Math.random() * 100,
          reason: 'trending',
          created_at: p.created_at,
        });
      });

      // Add vlogs
      mockVlogs.forEach(v => {
        items.push({
          id: `feed-${v.id}`,
          type: 'vlog',
          content: { ...v, author: mockProfiles.find(pr => pr.user_id === v.user_id) },
          relevance_score: Math.random() * 100,
          reason: 'interest',
          created_at: v.created_at,
        });
      });

      // Sort by relevance
      items.sort((a, b) => b.relevance_score - a.relevance_score);
      return items.slice(0, 20);
    }

    const { data, error } = await supabase.functions.invoke('get-explore-feed', {
      body: { filters, page },
    });
    if (error) throw error;
    return data || [];
  },

  async getTrendingSections(): Promise<TrendingSection[]> {
    if (isDemoMode) {
      return [
        { id: 'ts-1', title: 'Trending Hashtags', type: 'hashtags', items: mockHashtags.slice(0, 5) },
        { id: 'ts-2', title: 'Popular Destinations', type: 'locations', items: mockLocations.slice(0, 5) },
        { id: 'ts-3', title: 'Featured Vlogs', type: 'vlogs', items: mockVlogs.slice(0, 3) },
        { id: 'ts-4', title: 'Top Travelers', type: 'users', items: mockProfiles.slice(0, 5) },
      ];
    }
    const { data, error } = await supabase.functions.invoke('get-trending-sections');
    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<{ posts: ExperiencePost[]; vlogs: TravelVlog[]; users: Profile[]; locations: LocationTag[] }> {
    if (isDemoMode) {
      return {
        posts: mockExperiencePosts.filter(p => p.content.toLowerCase().includes(query.toLowerCase())),
        vlogs: mockVlogs.filter(v => v.title.toLowerCase().includes(query.toLowerCase())),
        users: mockProfiles.filter(p => p.full_name.toLowerCase().includes(query.toLowerCase())),
        locations: mockLocations.filter(l => l.name.toLowerCase().includes(query.toLowerCase())),
      };
    }
    const [postsRes, vlogsRes, usersRes, locsRes] = await Promise.all([
      supabase.from('experience_posts').select('*, author:profiles(*)').textSearch('content', query).limit(10),
      supabase.from('travel_vlogs').select('*, author:profiles(*)').textSearch('title', query).limit(10),
      supabase.from('profiles').select('*').ilike('full_name', `%${query}%`).limit(10),
      supabase.from('location_tags').select('*').ilike('name', `%${query}%`).limit(10),
    ]);
    return {
      posts: postsRes.data || [],
      vlogs: vlogsRes.data || [],
      users: usersRes.data || [],
      locations: locsRes.data || [],
    };
  },
};

// ==========================================
// Follow System Services
// ==========================================
export const followService = {
  async follow(userId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('follows').insert({ follower_id: 'current-user', following_id: userId });
  },

  async unfollow(userId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('follows').delete().eq('follower_id', 'current-user').eq('following_id', userId);
  },

  async getFollowers(userId: string): Promise<FollowRelation[]> {
    if (isDemoMode) {
      return mockProfiles.slice(0, 3).map(p => ({
        id: `f-${p.user_id}`,
        follower_id: p.user_id,
        following_id: userId,
        created_at: new Date().toISOString(),
        is_mutual: Math.random() > 0.5,
        notifications_enabled: true,
        follower: p,
      }));
    }
    const { data, error } = await supabase
      .from('follows')
      .select('*, follower:profiles!follower_id(*)')
      .eq('following_id', userId);
    if (error) throw error;
    return data || [];
  },

  async getFollowing(userId: string): Promise<FollowRelation[]> {
    if (isDemoMode) {
      return mockProfiles.slice(0, 3).map(p => ({
        id: `f-${p.user_id}`,
        follower_id: userId,
        following_id: p.user_id,
        created_at: new Date().toISOString(),
        is_mutual: Math.random() > 0.5,
        notifications_enabled: true,
        following: p,
      }));
    }
    const { data, error } = await supabase
      .from('follows')
      .select('*, following:profiles!following_id(*)')
      .eq('follower_id', userId);
    if (error) throw error;
    return data || [];
  },

  async getFollowStats(userId: string): Promise<FollowStats> {
    if (isDemoMode) {
      return { followers_count: 1250, following_count: 342, mutual_count: 89 };
    }
    const [followersRes, followingRes] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
      supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
    ]);
    return {
      followers_count: followersRes.count || 0,
      following_count: followingRes.count || 0,
      mutual_count: 0,
    };
  },

  async isFollowing(userId: string): Promise<boolean> {
    if (isDemoMode) return Math.random() > 0.5;
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', 'current-user')
      .eq('following_id', userId)
      .single();
    return !!data;
  },

  async getSuggestions(): Promise<FollowSuggestion[]> {
    if (isDemoMode) {
      return mockProfiles.slice(0, 5).map(p => ({
        user_id: p.user_id,
        reason: 'similar_interests',
        mutual_connections: Math.floor(Math.random() * 10),
        shared_interests: p.interests.slice(0, 2),
        profile: p,
      }));
    }
    const { data, error } = await supabase.functions.invoke('get-follow-suggestions');
    if (error) throw error;
    return data || [];
  },

  async toggleNotifications(userId: string, enabled: boolean): Promise<void> {
    if (isDemoMode) return;
    await supabase
      .from('follows')
      .update({ notifications_enabled: enabled })
      .eq('follower_id', 'current-user')
      .eq('following_id', userId);
  },
};

// ==========================================
// Activity Feed Services
// ==========================================
export const activityService = {
  async getActivities(page: number = 1): Promise<ActivityItem[]> {
    if (isDemoMode) {
      return [
        { id: 'act-1', type: 'like', actor_id: '2', target_type: 'post', target_id: 'exp-1', is_read: false, created_at: new Date().toISOString(), actor: mockProfiles[0], target_preview: 'Your post about Hampta Pass' },
        { id: 'act-2', type: 'follow', actor_id: '3', target_type: 'user', target_id: 'demo-user', is_read: false, created_at: new Date().toISOString(), actor: mockProfiles[1] },
        { id: 'act-3', type: 'comment', actor_id: '4', target_type: 'vlog', target_id: 'vlog-1', message: 'Amazing view!', is_read: true, created_at: new Date().toISOString(), actor: mockProfiles[2], target_preview: 'Your vlog' },
      ];
    }
    const { data, error } = await supabase
      .from('activities')
      .select('*, actor:profiles(*)')
      .eq('user_id', 'current-user')
      .order('created_at', { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);
    if (error) throw error;
    return data || [];
  },

  async markAsRead(activityId: string): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('activities').update({ is_read: true }).eq('id', activityId);
  },

  async markAllAsRead(): Promise<void> {
    if (isDemoMode) return;
    await supabase.from('activities').update({ is_read: true }).eq('user_id', 'current-user');
  },

  async getUnreadCount(): Promise<number> {
    if (isDemoMode) return 5;
    const { count, error } = await supabase
      .from('activities')
      .select('id', { count: 'exact' })
      .eq('user_id', 'current-user')
      .eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
};
