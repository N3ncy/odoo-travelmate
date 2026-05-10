import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useChatStore } from '@/store';
import {
  Home,
  Search,
  MapPin,
  MessageSquare,
  User,
  LogOut,
  Shield,
  Plus,
  Users,
  Compass,
  Play,
} from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { profile, isAuthenticated, logout } = useAuthStore();
  const { unreadCount: chatUnread } = useChatStore();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/city-search', icon: Search, label: 'Explore Cities' },
    { path: '/explore', icon: Compass, label: 'Community Feed' },
    { path: '/vlogs', icon: Play, label: 'Vlogs' },
    { path: '/search', icon: Search, label: 'Find Trips' },
    { path: '/trips', icon: MapPin, label: 'My Trips' },
    { path: '/matches', icon: Users, label: 'Matches' },
    { path: '/chat', icon: MessageSquare, label: 'Chat', badge: chatUnread },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 z-50 shadow-sm">
      <div className="p-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Traveloop
          </span>
        </Link>

        {/* Create Trip CTA */}
        <Link
          to="/trips/create"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg mb-8"
        >
          <Plus className="w-5 h-5" />
          Create Trip
        </Link>

        {/* Nav Links */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* User Profile Section (Bottom) */}
      <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50">
        <Link to="/profile" className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-gray-200/50 transition-colors">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`}
            alt={profile?.full_name}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{profile?.full_name}</p>
            {profile?.kyc_status === 'approved' ? (
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3" /> Verified
              </p>
            ) : (
              <p className="text-xs text-gray-500 truncate">{profile?.home_city || 'Traveler'}</p>
            )}
          </div>
        </Link>
        <button
          onClick={() => {
            logout();
            import('@/lib/supabase').then(({ supabase }) => supabase.auth.signOut());
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </nav>
  );
}
