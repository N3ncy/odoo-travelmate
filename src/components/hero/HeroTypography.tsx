import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroTypography() {
  const navigate = useNavigate();

  return (
    <div className="relative z-30 flex flex-col items-center justify-center pt-24 pb-16 px-4 md:pt-32 text-center w-full max-w-3xl mx-auto">
      
      {/* Cinematic Center Spotlight / Backdrop for contrast */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/80 via-white/40 to-transparent -z-10 blur-2xl pointer-events-none" />

      {/* Top Badge (Optional, removed to match exact image if desired, but keeping small for flair) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-emerald-500/20 backdrop-blur-md mb-6 shadow-sm"
      >
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-bold text-slate-800 tracking-wide">
          TravelMate
        </span>
      </motion.div>

      {/* Clean Structured Headline (Slate-900 like image) */}
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tight text-slate-800 leading-[1.15] mb-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-light"
        >
          Travel Smarter.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-extrabold text-slate-900"
        >
          Explore Together.
        </motion.div>
      </h1>

      {/* Glowing Sub-headline line */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="text-2xl md:text-3xl font-medium mb-6 text-slate-700"
      >
        Powered by{' '}
        <span className="font-bold text-emerald-500 drop-shadow-sm">
          TravelMate AI.
        </span>
      </motion.div>

      {/* Subheadline Text */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.0 }}
        className="text-sm md:text-base text-slate-600 font-medium max-w-2xl mb-12 leading-relaxed"
      >
        Build personalized multi-city trips, discover compatible travelers, optimize your budget, and experience intelligent travel planning — all in one platform.
      </motion.p>

      {/* CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center"
      >
        {/* Primary Emerald CTA */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/ai-planner')}
          className="group relative px-8 py-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-lg rounded-full transition-all duration-300 shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] w-full sm:w-auto overflow-hidden flex items-center justify-center gap-2 border border-emerald-300/50"
        >
          {/* Shine Sweep */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-[shine_1s_ease-in-out]" />
          <Sparkles className="w-5 h-5" />
          Plan My AI Trip
        </motion.button>

        {/* Secondary Light Transparent CTA */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/explore')}
          className="group relative px-8 py-4 bg-white/40 text-slate-900 font-bold text-lg rounded-full transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm border border-emerald-500/20 backdrop-blur-md"
        >
          Explore Smart Itineraries
          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </motion.div>
    </div>
  );
}
