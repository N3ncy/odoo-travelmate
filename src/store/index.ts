import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Profile,
  Trip,
  Match,
  ChatRoom,
  Message,
  Notification,
  TripParticipant,
  LocationUpdate,
  SafetyAlert,
  Post,
} from '@/types';

// ==========================================
// Auth Store
// ==========================================
interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasLoggedOut: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setHasLoggedOut: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      hasLoggedOut: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, hasLoggedOut: false }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasLoggedOut: (hasLoggedOut) => set({ hasLoggedOut }),
      logout: () => set({ user: null, profile: null, isAuthenticated: false, hasLoggedOut: true }),
    }),
    { name: 'auth-storage' }
  )
);

// ==========================================
// Trip Store
// ==========================================
interface TripState {
  trips: Trip[];
  myTrips: Trip[];
  currentTrip: Trip | null;
  participants: TripParticipant[];
  filters: Record<string, any>;
  setTrips: (trips: Trip[]) => void;
  setMyTrips: (trips: Trip[]) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setParticipants: (participants: TripParticipant[]) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  setFilters: (filters: Record<string, any>) => void;
}

export const useTripStore = create<TripState>((set) => ({
  trips: [],
  myTrips: [],
  currentTrip: null,
  participants: [],
  filters: {},
  setTrips: (trips) => set({ trips }),
  setMyTrips: (myTrips) => set({ myTrips }),
  setCurrentTrip: (currentTrip) => set({ currentTrip }),
  setParticipants: (participants) => set({ participants }),
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  updateTrip: (id, updates) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTrip:
        state.currentTrip?.id === id
          ? { ...state.currentTrip, ...updates }
          : state.currentTrip,
    })),
  setFilters: (filters) => set({ filters }),
}));

// ==========================================
// Match Store
// ==========================================
interface MatchState {
  matches: Match[];
  pendingInvites: Match[];
  setMatches: (matches: Match[]) => void;
  setPendingInvites: (invites: Match[]) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  matches: [],
  pendingInvites: [],
  setMatches: (matches) => set({ matches }),
  setPendingInvites: (pendingInvites) => set({ pendingInvites }),
  updateMatch: (id, updates) =>
    set((state) => ({
      matches: state.matches.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
}));

// ==========================================
// Chat Store
// ==========================================
interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  unreadCount: number;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setUnreadCount: (count: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  unreadCount: 0,
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
}));

// ==========================================
// Location Store
// ==========================================
interface LocationState {
  currentLocation: { lat: number; lng: number } | null;
  groupLocations: LocationUpdate[];
  isSharing: boolean;
  alerts: SafetyAlert[];
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void;
  setGroupLocations: (locations: LocationUpdate[]) => void;
  setIsSharing: (sharing: boolean) => void;
  setAlerts: (alerts: SafetyAlert[]) => void;
  addAlert: (alert: SafetyAlert) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  groupLocations: [],
  isSharing: false,
  alerts: [],
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setGroupLocations: (groupLocations) => set({ groupLocations }),
  setIsSharing: (isSharing) => set({ isSharing }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
}));

// ==========================================
// Notification Store
// ==========================================
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}));

// ==========================================
// Social Store (Phase 2-3)
// ==========================================
interface SocialState {
  feed: Post[];
  userPosts: Post[];
  explorePosts: Post[];
  following: string[];
  followers: string[];
  setFeed: (posts: Post[]) => void;
  setUserPosts: (posts: Post[]) => void;
  setExplorePosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  setFollowing: (ids: string[]) => void;
  setFollowers: (ids: string[]) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  feed: [],
  userPosts: [],
  explorePosts: [],
  following: [],
  followers: [],
  setFeed: (feed) => set({ feed }),
  setUserPosts: (userPosts) => set({ userPosts }),
  setExplorePosts: (explorePosts) => set({ explorePosts }),
  addPost: (post) => set((state) => ({ feed: [post, ...state.feed] })),
  setFollowing: (following) => set({ following }),
  setFollowers: (followers) => set({ followers }),
}));

// ==========================================
// UI Store
// ==========================================
interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  modalOpen: string | null;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setModalOpen: (modal: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      activeTab: 'home',
      modalOpen: null,
      theme: 'light',
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setModalOpen: (modalOpen) => set({ modalOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-storage' }
  )
);
