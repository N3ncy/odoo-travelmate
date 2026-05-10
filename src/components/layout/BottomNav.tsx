import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Users, User } from 'lucide-react';
import { useAuthStore } from '@/store';

export function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 relative px-2">
        <Link to="/" className={`flex flex-col items-center gap-1 p-2 ${isActive('/') ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link to="/city-search" className={`flex flex-col items-center gap-1 p-2 ${isActive('/city-search') ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explore</span>
        </Link>
        
        {/* Create Trip FAB (Center) */}
        <div className="relative -top-5 flex flex-col items-center">
          <Link to="/trips/create" className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white hover:bg-emerald-700 transition-transform active:scale-95 border-4 border-gray-50">
            <Plus className="w-6 h-6" />
          </Link>
          <span className="text-[10px] font-medium text-emerald-600 mt-1">Create</span>
        </div>

        <Link to="/matches" className={`flex flex-col items-center gap-1 p-2 ${isActive('/matches') ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Matches</span>
        </Link>

        <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 ${isActive('/profile') ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
