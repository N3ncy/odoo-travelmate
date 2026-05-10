import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useChatStore } from '@/store';
import {
  Home,
  Search,
  MapPin,
  MessageSquare,
  User,
  X,
  LogOut,
  Shield,
  Plus,
  Users,
  Compass,
  Play,
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const { profile, isAuthenticated } = useAuthStore();
  const { unreadCount: chatUnread } = useChatStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Phase-1 + Phase-2 + Phase-3 Navigation
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/vlogs', icon: Play, label: 'Vlogs' },
    { path: '/search', icon: Search, label: 'Find Trips' },
    { path: '/trips', icon: MapPin, label: 'My Trips' },
    { path: '/matches', icon: Users, label: 'Matches' },
    { path: '/chat', icon: MessageSquare, label: 'Chat', badge: chatUnread },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Traveloop
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Create Trip Button */}
            <Link
              to="/trips/create"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Trip</span>
            </Link>

            {/* KYC Status Badge */}
            {profile?.kyc_status === 'approved' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm">
                <Shield className="w-4 h-4" />
                <span>Verified</span>
              </div>
            )}

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50"
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`}
                  alt={profile?.full_name}
                  className="w-8 h-8 rounded-full"
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{profile?.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">{profile?.location}</span>
                      {profile?.trust_score && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Trust: {profile.trust_score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/kyc"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Shield className="w-5 h-5" />
                    <span>KYC Verification</span>
                  </Link>
                  <hr className="my-2" />
                  <Link
                    to="/logout"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {/* Show Home, Explore, Vlogs, Chat on mobile */}
          {[navItems[0], navItems[1], navItems[2], navItems[6]].filter(Boolean).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 ${
                isActive(item.path) ? 'text-emerald-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 px-3 py-2 ${
              isActive('/profile') ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-20" />
    </>
  );
}
