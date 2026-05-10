import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, Map,
  Bot, PieChart, Plane,
  Zap, Users, Wallet, Headphones
} from 'lucide-react';
import { AuthModal } from '../components/auth/AuthModal';
import { AITripWizard } from '../components/AITripWizard';
import { useAuth } from '@/hooks/useAuth';

/* ─────────────────────────── tiny helpers ───────────────────────────── */
const FloatCard = ({
  icon, title, subtitle, onClick, delay, className
}: {
  icon: React.ReactNode; title: string; subtitle: string;
  onClick: () => void; delay: number; className?: string;
}) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
    transition={{
      opacity: { duration: 0.6, delay },
      scale: { duration: 0.6, delay },
      y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
    }}
    whileHover={{ scale: 1.06, y: -10 }}
    className={`flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/90
      rounded-2xl px-4 py-3 shadow-lg shadow-black/10 cursor-pointer text-left
      hover:shadow-xl hover:shadow-black/15 transition-shadow ${className ?? ''}`}
  >
    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-slate-900 leading-tight">{title}</p>
      <p className="text-xs text-slate-500 font-medium leading-tight">{subtitle}</p>
    </div>
  </motion.button>
);

const BarFeature = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) => (
  <div className="flex items-center gap-2.5 group cursor-pointer px-3">
    <div className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0">{icon}</div>
    <div>
      <p className="text-[13px] font-bold text-white leading-tight">{title}</p>
      <p className="text-[10px] text-slate-400 leading-tight uppercase tracking-wide">{sub}</p>
    </div>
  </div>
);

/* ─────────────────────────── main page ─────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handlePlanClick = () => {
    if (isAuthenticated) {
      setWizardOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div
      className="relative w-full min-h-screen font-sans overflow-x-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #fdf6e3 0%, #fde8c8 30%, #fce4b0 60%, #e8f5e9 100%)' }}
    >
      {/* Subtle bottom darkening for the feature bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-0 pointer-events-none" />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 flex justify-between items-center px-8 pt-6 pb-2 max-w-[1400px] mx-auto w-full"
      >
        {/* Empty left spacer to keep logo centered */}
        <div className="w-36" />

        {/* Logo – centered */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 group mx-auto">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow shadow-emerald-500/40 group-hover:scale-110 transition-transform">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">TravelMate</span>
        </button>

        {/* Login button – right */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAuthOpen(true)}
          className="w-36 text-right pr-2 text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
        >
          Login / Signup
        </motion.button>
      </motion.nav>

      {/* ── HERO GRID ── */}
      <div className="relative z-30 flex items-center justify-between px-4 md:px-10 max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">

        {/* ── LEFT CARDS ── */}
        <div className="hidden lg:flex flex-col gap-5 items-end w-[260px] shrink-0 mt-[-60px]">
          <FloatCard
            icon={<Bot className="w-5 h-5 text-emerald-600" />}
            title="92%"
            subtitle="Traveler Match"
            onClick={() => navigate('/matches')}
            delay={0.4}
          />
          <FloatCard
            icon={<PieChart className="w-5 h-5 text-emerald-600" />}
            title="AI Budget"
            subtitle="Optimized"
            onClick={() => navigate('/budget')}
            delay={0.6}
          />
        </div>

        {/* ── CENTER CONTENT ── */}
        <div className="flex-1 flex flex-col items-center text-center px-4 md:px-8 pt-6">

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-slate-800 leading-[1.15] mb-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <span className="font-light block">Travel Smarter.</span>
            <span className="font-extrabold block text-slate-900">Explore Together.</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-xl md:text-2xl font-medium text-slate-700 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Powered by{' '}
            <span className="font-extrabold text-emerald-500">TravelMate AI.</span>
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-sm md:text-base text-slate-600 max-w-lg mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Build personalized multi-city trips, discover compatible travelers,
            optimize your budget, and experience intelligent travel planning —
            all in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {/* Primary */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlanClick}
              className="group relative flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-extrabold text-lg shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shine_0.8s_ease-in-out]" />
              <Sparkles className="w-5 h-5" />
              Plan My AI Trip
            </motion.button>

            {/* Secondary */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/explore')}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/70 text-slate-900 font-bold text-lg hover:bg-white/60 transition-all shadow"
            >
              Explore Smart Itineraries
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* ── RIGHT CARDS ── */}
        <div className="hidden lg:flex flex-col gap-5 items-start w-[260px] shrink-0 mt-[-60px]">
          <FloatCard
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            title="Verified"
            subtitle="Safe Travelers"
            onClick={() => navigate('/community')}
            delay={0.5}
          />
          <FloatCard
            icon={<Map className="w-5 h-5 text-emerald-600" />}
            title="Smart Itinerary"
            subtitle="Ready"
            onClick={() => navigate('/ai-planner')}
            delay={0.7}
          />
        </div>
      </div>

      {/* ── BOTTOM FEATURE BAR ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.2, ease: 'easeOut' }}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-2 overflow-x-auto">
            
            <BarFeature icon={<Zap className="w-5 h-5" />} title="AI Trip Planner" sub="Personalized For You" />
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <BarFeature icon={<Map className="w-5 h-5" />} title="Multi-City Builder" sub="Smart Route Optimization" />
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <BarFeature icon={<Users className="w-5 h-5" />} title="Travel Companion Match" sub="Find Compatible Travelers" />
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <BarFeature icon={<Wallet className="w-5 h-5" />} title="Budget Optimizer" sub="Save More, Travel More" />
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <BarFeature icon={<Headphones className="w-5 h-5" />} title="Real-Time Support" sub="AI-Powered Assistance" />

          </div>
        </div>
      </motion.div>

      {/* ── AUTH MODAL ── */}
      <AnimatePresence>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </AnimatePresence>

      {/* ── AI TRIP WIZARD ── */}
      <AnimatePresence>
        {wizardOpen && <AITripWizard onClose={() => setWizardOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
