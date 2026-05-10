import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';

// Phase-1 Pages
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { KYCPage } from '@/pages/KYCPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { TripsPage } from '@/pages/TripsPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { SearchTripsPage } from '@/pages/SearchTripsPage';
import { MatchesPage } from '@/pages/MatchesPage';
import { ChatPage } from '@/pages/ChatPage';
import { ActiveTripPage } from '@/pages/ActiveTripPage';
import { RatingPage } from '@/pages/RatingPage';
import { LandingPage } from '@/pages/LandingPage';

// Phase-2 Pages
import { GroupChatPage } from '@/pages/GroupChatPage';
import { CommunityBoardsPage } from '@/pages/CommunityBoardsPage';
import { ItineraryPage } from '@/pages/ItineraryPage';

// Phase-3 Pages - Content Platform
import { ExplorePage } from '@/pages/ExplorePage';
import { StoriesPage } from '@/pages/StoriesPage';
import { VlogsPage } from '@/pages/VlogsPage';

// New Pages
import { BudgetPage } from '@/pages/BudgetPage';
import { TripSharePage } from '@/pages/TripSharePage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { AIPlannerPage } from '@/pages/AIPlannerPage';
import { CitySearchPage } from '@/pages/CitySearchPage';
import { ActivitySearchPage } from '@/pages/ActivitySearchPage';
import { TripNotesPage } from '@/pages/TripNotesPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading Traveloop...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  // Check if onboarding is complete
  if (profile && !profile.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Onboarding Route
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Layout with Navbar
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

// Logout Handler
function LogoutHandler() {
  const { signOut } = useAuth();

  React.useEffect(() => {
    signOut();
  }, [signOut]);

  return <Navigate to="/landing" replace />;
}

export default function App() {
  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Onboarding & KYC */}
        <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
        <Route path="/kyc" element={<OnboardingRoute><KYCPage /></OnboardingRoute>} />

        {/* Phase-1 Core Features */}
        <Route path="/" element={<ProtectedRoute><AppLayout><HomePage /></AppLayout></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><AppLayout><TripsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/trips/create" element={<ProtectedRoute><AppLayout><CreateTripPage /></AppLayout></ProtectedRoute>} />
        <Route path="/trips/:id" element={<ProtectedRoute><AppLayout><TripDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><AppLayout><SearchTripsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><AppLayout><MatchesPage /></AppLayout></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>} />
        <Route path="/chat/:roomId" element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>} />
        <Route path="/active-trip/:tripId" element={<ProtectedRoute><ActiveTripPage /></ProtectedRoute>} />
        <Route path="/rate/:tripId/:userId" element={<ProtectedRoute><AppLayout><RatingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />

        {/* Phase-2 Features */}
        <Route path="/group-chat/:roomId" element={<ProtectedRoute><GroupChatPage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><AppLayout><CommunityBoardsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/community/:boardId" element={<ProtectedRoute><AppLayout><CommunityBoardsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/itinerary/:tripId" element={<ProtectedRoute><AppLayout><ItineraryPage /></AppLayout></ProtectedRoute>} />

        {/* Phase-3 Features - Content Platform */}
        <Route path="/explore" element={<ProtectedRoute><AppLayout><ExplorePage /></AppLayout></ProtectedRoute>} />
        <Route path="/stories/:userId" element={<ProtectedRoute><StoriesPage /></ProtectedRoute>} />
        <Route path="/vlogs" element={<ProtectedRoute><VlogsPage /></ProtectedRoute>} />
        <Route path="/vlogs/:vlogId" element={<ProtectedRoute><VlogsPage /></ProtectedRoute>} />
        
        {/* New Features */}
        <Route path="/budget/:tripId" element={<ProtectedRoute><AppLayout><BudgetPage /></AppLayout></ProtectedRoute>} />
        <Route path="/ai-planner" element={<ProtectedRoute><AppLayout><AIPlannerPage /></AppLayout></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AppLayout><AdminAnalyticsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/trip-share/:tripId" element={<TripSharePage />} />
        <Route path="/city-search" element={<ProtectedRoute><AppLayout><CitySearchPage /></AppLayout></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><AppLayout><ActivitySearchPage /></AppLayout></ProtectedRoute>} />
        <Route path="/trips/:tripId/notes" element={<ProtectedRoute><AppLayout><TripNotesPage /></AppLayout></ProtectedRoute>} />

        {/* Logout */}
        <Route path="/logout" element={<LogoutHandler />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-4">Page not found</p>
                <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
