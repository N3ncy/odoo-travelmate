import { motion } from 'framer-motion';
import { Sparkles, Map, Users, Wallet, Headphones } from 'lucide-react';

const features = [
  { icon: <Sparkles />, title: "AI Trip Planner", desc: "Personalized For You" },
  { icon: <Map />, title: "Multi-City Builder", desc: "Smart Route Optimization" },
  { icon: <Users />, title: "Companion Match", desc: "Find Compatible Travelers" },
  { icon: <Wallet />, title: "Budget Optimizer", desc: "Save More, Travel More" },
  { icon: <Headphones />, title: "Real-Time Support", desc: "AI-Powered Assistance" },
];

export function BottomFeatureBar() {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-40 hidden md:flex justify-center px-6">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 2, ease: "easeOut" }}
        className="flex items-center gap-2 lg:gap-6 px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
      >
        {features.map((feat, i) => (
          <div key={i} className="flex items-center gap-3 group cursor-pointer relative px-4">
            {/* Divider */}
            {i !== 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-white/10" />
            )}
            
            <div className="text-emerald-500/70 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300">
              {feat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                {feat.title}
              </span>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors uppercase tracking-wider">
                {feat.desc}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
