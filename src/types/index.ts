// ==========================================
// Traveloop - Type Definitions
// ==========================================

// User & Profile Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;
  interests: string[];
  travel_style: TravelStyle[];
  languages: string[];
  location?: string;
  safety_badge: SafetyBadge;
  is_verified: boolean;
  is_premium: boolean;
  rating_avg: number;
  total_trips: number;
  trust_score: number;
  kyc_status: 'none' | 'pending' | 'approved' | 'rejected';
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export type TravelStyle =
  | 'adventure'
  | 'relaxation'
  | 'cultural'
  | 'budget'
  | 'luxury'
  | 'solo'
  | 'backpacking'
  | 'photography'
  | 'food_explorer'
  | 'nature';

export type SafetyBadge = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

// KYC Types
export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: 'aadhaar' | 'pan' | 'driving_license' | 'passport';
  document_url: string;
  document_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

// Trip Types
export interface Trip {
  id: string;
  creator_id: string;
  title: string;
  destination: string;
  destination_coords?: { lat: number; lng: number };
  start_date: string;
  end_date: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency: string;
  travel_style: TravelStyle[];
  gender_preference: 'any' | 'male' | 'female' | 'same_gender';
  age_range_min?: number;
  age_range_max?: number;
  max_participants: number;
  current_participants: number;
  interests: string[];
  description?: string;
  itinerary?: TripItinerary[];
  status: TripStatus;
  is_group_trip: boolean;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export type TripStatus =
  | 'draft'
  | 'open'
  | 'matched'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface TripItinerary {
  day: number;
  title: string;
  description?: string;
  locations?: string[];
}

export interface TripParticipant {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'creator' | 'participant';
  status: 'invited' | 'pending' | 'accepted' | 'rejected' | 'left';
  otp_verified: boolean;
  end_otp_verified: boolean;
  joined_at?: string;
  left_at?: string;
  profile?: Profile;
}

// Matching Types
export interface Match {
  id: string;
  trip_id: string;
  user_id: string;
  matched_user_id: string;
  compatibility_score: number;
  score_breakdown: ScoreBreakdown;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  matched_user?: Profile;
  trip?: Trip;
}

export interface ScoreBreakdown {
  destination: number;
  date_overlap: number;
  interests: number;
  travel_style: number;
  safety_preference: number;
  rating: number;
}

// Chat Types
export interface ChatRoom {
  id: string;
  trip_id?: string;
  type: 'direct' | 'group';
  name?: string;
  created_at: string;
  participants: ChatParticipant[];
  last_message?: Message;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location' | 'system';
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

// Safety & Location Types
export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  is_primary: boolean;
}

export interface LocationUpdate {
  id: string;
  user_id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface SafetyAlert {
  id: string;
  trip_id: string;
  user_id: string;
  alert_type: 'panic' | 'distance_warning' | 'geofence_breach' | 'sos';
  message?: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'resolved' | 'acknowledged';
  created_at: string;
  resolved_at?: string;
}

// OTP Types
export interface TripOTP {
  id: string;
  trip_id: string;
  user_id: string;
  otp_code: string;
  otp_type: 'start' | 'end';
  is_verified: boolean;
  expires_at: string;
  created_at: string;
}

// Rating & Review Types
export interface Rating {
  id: string;
  trip_id: string;
  rater_id: string;
  rated_user_id: string;
  overall_rating: number;
  safety_rating: number;
  communication_rating: number;
  punctuality_rating: number;
  review_text?: string;
  created_at: string;
  rater?: Profile;
}

// Report & Block Types
export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  trip_id?: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: string;
}

export type ReportReason =
  | 'harassment'
  | 'inappropriate_behavior'
  | 'fake_profile'
  | 'safety_concern'
  | 'spam'
  | 'other';

export interface BlockedUser {
  id: string;
  user_id: string;
  blocked_user_id: string;
  reason?: string;
  created_at: string;
}

// Social Features (Phase 2-3)
export interface Post {
  id: string;
  user_id: string;
  trip_id?: string;
  content: string;
  post_type: 'story' | 'vlog' | 'post' | 'hack' | 'recommendation';
  media_urls: string[];
  location_name?: string;
  location_coords?: { lat: number; lng: number };
  tags: string[];
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  author?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface CommunityBoard {
  id: string;
  name: string;
  description?: string;
  cover_image?: string;
  category: string;
  members_count: number;
  created_at: string;
}

// Travel Utility (Phase 4)
export interface TravelRecommendation {
  id: string;
  destination: string;
  category: 'must_visit' | 'food' | 'accommodation' | 'activity' | 'hidden_gem';
  name: string;
  description?: string;
  image_url?: string;
  rating?: number;
  price_range?: string;
  location_coords?: { lat: number; lng: number };
  tags: string[];
}

export interface DangerousArea {
  id: string;
  location_name: string;
  location_coords: { lat: number; lng: number };
  radius_meters: number;
  severity: 'low' | 'medium' | 'high';
  description?: string;
  reported_at: string;
}

// Marketplace (Phase 5)
export interface LocalGuide {
  id: string;
  user_id: string;
  destination: string;
  languages: string[];
  specialties: string[];
  hourly_rate: number;
  currency: string;
  rating_avg: number;
  total_bookings: number;
  is_verified: boolean;
  profile?: Profile;
}

export interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverage_type: string;
  price_per_day: number;
  currency: string;
  features: string[];
}

export interface PartnerDeal {
  id: string;
  partner_name: string;
  category: 'hotel' | 'restaurant' | 'activity' | 'transport' | 'gear';
  title: string;
  description?: string;
  discount_percent?: number;
  promo_code?: string;
  valid_until?: string;
  image_url?: string;
}

// Follow System
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'match'
  | 'invite'
  | 'message'
  | 'trip_update'
  | 'safety_alert'
  | 'otp'
  | 'rating'
  | 'follow'
  | 'like'
  | 'comment';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter Types
export interface TripFilters {
  destination?: string;
  startDate?: string;
  endDate?: string;
  budgetMin?: number;
  budgetMax?: number;
  travelStyle?: TravelStyle[];
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  interests?: string[];
}

export interface MatchFilters {
  minScore?: number;
  status?: string;
}

// ==========================================
// Phase-2 Types
// ==========================================

// Group Trip Types
export interface GroupTrip extends Trip {
  is_group_trip: true;
  visibility: 'public' | 'private' | 'invite_only';
  group_settings: GroupSettings;
  roles: GroupRole[];
}

export interface GroupSettings {
  allow_member_invites: boolean;
  require_approval: boolean;
  max_distance_alert: number; // in meters
  enable_location_sharing: boolean;
  enable_battery_alerts: boolean;
  low_battery_threshold: number; // percentage
}

export interface GroupRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  permissions: GroupPermission[];
  assigned_at: string;
  assigned_by?: string;
}

export type GroupPermission =
  | 'manage_members'
  | 'edit_trip'
  | 'delete_messages'
  | 'manage_itinerary'
  | 'send_alerts'
  | 'view_locations';

export interface GroupInvite {
  id: string;
  trip_id: string;
  inviter_id: string;
  invitee_id?: string;
  invitee_email?: string;
  invitee_phone?: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  inviter?: Profile;
  invitee?: Profile;
}

// Group Chat Types (WebSocket)
export interface GroupChatMessage extends Message {
  reply_to?: string;
  mentions: string[];
  reactions: MessageReaction[];
  is_pinned: boolean;
  is_deleted: boolean;
  edited_at?: string;
}

export interface MessageReaction {
  emoji: string;
  user_ids: string[];
  count: number;
}

export interface TypingIndicator {
  room_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
}

export interface ChatModeration {
  id: string;
  room_id: string;
  moderator_id: string;
  target_user_id: string;
  action: 'warn' | 'mute' | 'kick' | 'ban';
  reason?: string;
  duration_minutes?: number;
  created_at: string;
  expires_at?: string;
}

// WebSocket Event Types
export type WebSocketEvent =
  | { type: 'message'; payload: GroupChatMessage }
  | { type: 'typing'; payload: TypingIndicator }
  | { type: 'typing_stop'; payload: { room_id: string; user_id: string } }
  | { type: 'message_read'; payload: { room_id: string; message_id: string; user_id: string } }
  | { type: 'reaction'; payload: { message_id: string; emoji: string; user_id: string } }
  | { type: 'member_joined'; payload: { room_id: string; user: Profile } }
  | { type: 'member_left'; payload: { room_id: string; user_id: string } }
  | { type: 'safety_alert'; payload: GroupSafetyAlert }
  | { type: 'location_update'; payload: LocationUpdate };

// Group Safety Alerts
export interface GroupSafetyAlert extends Omit<SafetyAlert, 'alert_type'> {
  alert_type: 'panic' | 'distance_warning' | 'geofence_breach' | 'sos' | 'low_battery' | 'offline';
  affected_users: string[];
  distance_from_group?: number;
  battery_level?: number;
  last_seen?: string;
  acknowledged_by: string[];
}

export interface DistanceAlert {
  id: string;
  trip_id: string;
  user_id: string;
  distance_from_nearest: number;
  distance_from_centroid: number;
  threshold_exceeded: boolean;
  nearest_member_id: string;
  created_at: string;
}

export interface BatteryStatus {
  user_id: string;
  trip_id: string;
  level: number;
  is_charging: boolean;
  last_updated: string;
}

// Community Boards (Text Only)
export interface CommunityPost {
  id: string;
  board_id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'question' | 'tip' | 'discussion' | 'recommendation' | 'warning';
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_moderated: boolean;
  moderation_reason?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  parent_reply_id?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: CommunityReply[];
}

export interface CommunityVote {
  id: string;
  user_id: string;
  target_id: string;
  target_type: 'post' | 'reply';
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface BoardMembership {
  id: string;
  board_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

// Trip Reminders & Itinerary
export interface TripReminder {
  id: string;
  trip_id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'packing' | 'document' | 'booking' | 'meeting' | 'activity' | 'custom';
  due_date: string;
  due_time?: string;
  is_completed: boolean;
  notification_sent: boolean;
  notify_before_minutes: number;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  description?: string;
  location_name?: string;
  location_coords?: { lat: number; lng: number };
  start_time?: string;
  end_time?: string;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'sightseeing' | 'rest' | 'other';
  booking_reference?: string;
  cost_estimate?: number;
  notes?: string;
  attachments?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryShare {
  id: string;
  trip_id: string;
  shared_by: string;
  share_type: 'link' | 'email' | 'in_app';
  share_url?: string;
  recipient_email?: string;
  recipient_user_id?: string;
  permissions: 'view' | 'edit';
  expires_at?: string;
  created_at: string;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  user_id: string;
  item_name: string;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medicine' | 'other';
  quantity: number;
  is_packed: boolean;
  is_shared: boolean;
  created_at: string;
}

// ==========================================
// Phase-3 Types: Content Platform
// ==========================================

// Travel Vlogs (20-30 sec videos)
export interface TravelVlog {
  id: string;
  user_id: string;
  trip_id?: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url: string;
  hls_url?: string; // HLS streaming URL
  duration_seconds: number;
  file_size_bytes: number;
  resolution: '720p' | '1080p' | '4k';
  processing_status: 'uploading' | 'processing' | 'ready' | 'failed';
  processing_error?: string;
  location_tag?: LocationTag;
  hashtags: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface VlogComment {
  id: string;
  vlog_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  author?: Profile;
  replies?: VlogComment[];
}

export interface VlogUploadProgress {
  id: string;
  file_name: string;
  total_bytes: number;
  uploaded_bytes: number;
  progress_percent: number;
  status: 'pending' | 'uploading' | 'compressing' | 'processing' | 'complete' | 'error';
  error_message?: string;
  estimated_time_remaining?: number;
}

// Travel Stories (24-hour disappearing)
export interface TravelStory {
  id: string;
  user_id: string;
  trip_id?: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  caption?: string;
  location_tag?: LocationTag;
  hashtags: string[];
  background_color?: string;
  text_overlays: StoryTextOverlay[];
  stickers: StorySticker[];
  music_track?: StoryMusic;
  views_count: number;
  reactions: StoryReaction[];
  expires_at: string;
  created_at: string;
  is_seen?: boolean;
  author?: Profile;
}

export interface StoryTextOverlay {
  id: string;
  text: string;
  position_x: number;
  position_y: number;
  font_size: number;
  font_family: string;
  color: string;
  background_color?: string;
  rotation: number;
}

export interface StorySticker {
  id: string;
  type: 'emoji' | 'location' | 'mention' | 'hashtag' | 'poll' | 'question' | 'countdown';
  content: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  data?: Record<string, any>;
}

export interface StoryMusic {
  id: string;
  title: string;
  artist: string;
  preview_url: string;
  start_time: number;
  duration: number;
}

export interface StoryReaction {
  emoji: string;
  user_ids: string[];
  count: number;
}

export interface StoryViewer {
  user_id: string;
  viewed_at: string;
  reaction?: string;
  profile?: Profile;
}

export interface StoryRing {
  user_id: string;
  has_unseen: boolean;
  stories_count: number;
  latest_story_at: string;
  profile?: Profile;
}

// Location Tagging
export interface LocationTag {
  id: string;
  name: string;
  formatted_address?: string;
  city?: string;
  state?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  place_id?: string; // Google/Mapbox place ID
  category?: 'city' | 'landmark' | 'restaurant' | 'hotel' | 'attraction' | 'nature' | 'beach' | 'mountain' | 'other';
  photos?: string[];
  posts_count: number;
  vlogs_count: number;
  stories_count: number;
  is_verified: boolean;
}

export interface NearbyLocation {
  location_tag: LocationTag;
  distance_meters: number;
}

export interface PopularLocation {
  location_tag: LocationTag;
  trending_score: number;
  recent_posts_count: number;
}

// Experience Posts / Micro-Blogs
export interface ExperiencePost {
  id: string;
  user_id: string;
  trip_id?: string;
  content: string;
  post_type: 'experience' | 'tip' | 'review' | 'question' | 'recommendation' | 'warning';
  media_urls: string[];
  media_types: ('image' | 'video')[];
  location_tag?: LocationTag;
  hashtags: string[];
  mentions: string[];
  rating?: number; // 1-5 for reviews
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  is_bookmarked?: boolean;
  is_liked?: boolean;
  is_featured: boolean;
  is_public: boolean;
  edit_history: PostEdit[];
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface PostEdit {
  edited_at: string;
  previous_content: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  replies_count: number;
  is_liked?: boolean;
  created_at: string;
  author?: Profile;
  replies?: PostComment[];
}

export interface PostBookmark {
  id: string;
  user_id: string;
  post_id: string;
  collection_id?: string;
  created_at: string;
  post?: ExperiencePost;
}

export interface BookmarkCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cover_image?: string;
  is_private: boolean;
  items_count: number;
  created_at: string;
}

// Hashtags
export interface Hashtag {
  id: string;
  tag: string;
  posts_count: number;
  vlogs_count: number;
  stories_count: number;
  trending_score: number;
  is_trending: boolean;
  created_at: string;
}

// Explore Feed
export interface ExploreFeedItem {
  id: string;
  type: 'post' | 'vlog' | 'story' | 'user' | 'location' | 'hashtag';
  content: ExperiencePost | TravelVlog | TravelStory | Profile | LocationTag | Hashtag;
  relevance_score: number;
  reason?: 'following' | 'interest' | 'location' | 'trending' | 'suggested' | 'sponsored';
  created_at: string;
}

export interface ExploreFilters {
  content_types?: ('post' | 'vlog' | 'story')[];
  location_id?: string;
  hashtag?: string;
  date_range?: 'today' | 'week' | 'month' | 'year' | 'all';
  sort_by?: 'recent' | 'popular' | 'trending' | 'relevant';
  interests?: string[];
  min_rating?: number;
}

export interface TrendingSection {
  id: string;
  title: string;
  type: 'hashtags' | 'locations' | 'users' | 'vlogs';
  items: (Hashtag | LocationTag | Profile | TravelVlog)[];
}

// Follow System (Enhanced)
export interface FollowRelation extends Follow {
  is_mutual: boolean;
  notifications_enabled: boolean;
  follower?: Profile;
  following?: Profile;
}

export interface FollowRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  responded_at?: string;
  requester?: Profile;
}

export interface FollowStats {
  followers_count: number;
  following_count: number;
  mutual_count: number;
}

export interface FollowSuggestion {
  user_id: string;
  reason: 'mutual_friends' | 'similar_interests' | 'same_location' | 'popular' | 'similar_trips';
  mutual_connections: number;
  shared_interests: string[];
  profile?: Profile;
}

// Activity Feed
export interface ActivityItem {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'share' | 'tag';
  actor_id: string;
  target_type: 'post' | 'vlog' | 'story' | 'comment' | 'user';
  target_id: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  target_preview?: string;
}

// Content Reporting
export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: 'post' | 'vlog' | 'story' | 'comment' | 'user';
  content_id: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
}

// Analytics (for creators)
export interface ContentAnalytics {
  content_id: string;
  content_type: 'post' | 'vlog' | 'story';
  views: number;
  unique_viewers: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  avg_watch_time?: number;
  completion_rate?: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  demographics: {
    age_groups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  date_range: {
    start: string;
    end: string;
  };
}
