import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroContent() {
  const navigate = useNavigate();

  // Staggering variants for the text lines
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="relative z-20 flex flex-col items-center justify-center pt-24 pb-16 px-4 md:pt-32 text-center max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Badge */}
      <motion.div 
        variants={itemVariants}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-lg shadow-emerald-500/10"
      >
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-sm font-medium text-gray-300 tracking-wide">
          TravelMate is the future of intelligent travel planning
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1 
        variants={itemVariants}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl"
      >
        Your Trip. Your Vibe. <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
          TravelMate AI Handles the Rest.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p 
        variants={itemVariants}
        className="text-lg md:text-xl text-gray-400 font-medium max-w-3xl mb-12 leading-relaxed"
      >
        TravelMate creates personalized multi-city journeys, matches you with compatible travelers, optimizes your budget, and helps you explore the world smarter and safer.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center"
      >
        <button 
          onClick={() => navigate('/ai-planner')}
          className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] w-full sm:w-auto overflow-hidden flex items-center justify-center gap-2"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shine_1s_ease-in-out]" />
          <Sparkles className="w-5 h-5" />
          Plan My Trip with AI
        </button>

        <button 
          onClick={() => navigate('/explore')}
          className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-2xl border border-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg w-full sm:w-auto flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          Explore Smart Trips
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
        </button>
      </motion.div>

      {/* Trust Text Footer */}
      <motion.div 
        variants={itemVariants}
        className="mt-16 flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-gray-500"
      >
        {[
          { icon: <CheckCircle className="w-4 h-4 text-emerald-500/70" />, text: "Trusted by Verified Travelers" },
          { icon: <Sparkles className="w-4 h-4 text-blue-500/70" />, text: "AI-Powered Travel Planning" },
          { icon: <Shield className="w-4 h-4 text-amber-500/70" />, text: "Safe Group Travel" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.icon}
            <span className="tracking-wide">{item.text}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
