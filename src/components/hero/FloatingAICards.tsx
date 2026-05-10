import { motion } from 'framer-motion';
import { Bot, ShieldCheck, PieChart, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, subtitle, route, delay }: { icon: React.ReactNode, title: string, subtitle: string, route: string, delay: number }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="cursor-pointer pointer-events-auto"
      initial={{ opacity: 0, x: delay % 2 === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay, type: "spring", stiffness: 50 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={() => navigate(route)}
    >
      <div className="group relative flex items-center gap-4 px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-lg shadow-amber-900/5 transition-all duration-300 overflow-hidden w-[220px] md:w-[260px]">
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
        
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800 tracking-wide group-hover:text-emerald-600 transition-colors">
            {title}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {subtitle}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export function LeftFeatureCards() {
  return (
    <div className="flex flex-col gap-8 items-end justify-center h-full mt-10">
      <FeatureCard 
        icon={<Bot className="w-5 h-5 text-emerald-500" />}
        title="92%"
        subtitle="Traveler Match"
        route="/matches"
        delay={0.5}
      />
      <FeatureCard 
        icon={<PieChart className="w-5 h-5 text-emerald-500" />}
        title="AI Budget"
        subtitle="Optimized"
        route="/budget"
        delay={0.8}
      />
    </div>
  );
}

export function RightFeatureCards() {
  return (
    <div className="flex flex-col gap-8 items-start justify-center h-full mt-10">
      <FeatureCard 
        icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
        title="Verified"
        subtitle="Safe Travelers"
        route="/community"
        delay={0.6}
      />
      <FeatureCard 
        icon={<Map className="w-5 h-5 text-emerald-500" />}
        title="Smart Itinerary"
        subtitle="Ready"
        route="/ai-planner"
        delay={0.9}
      />
    </div>
  );
}
