import { motion } from 'framer-motion';
import { Bot, Map, ShieldCheck, TrendingDown } from 'lucide-react';

const features = [
  {
    icon: <TrendingDown className="w-4 h-4 text-emerald-400" />,
    title: "AI Budget Optimization",
    delay: 0,
    position: "top-[15%] left-[10%]",
    floatY: [-10, 10, -10]
  },
  {
    icon: <Bot className="w-4 h-4 text-blue-400" />,
    title: "92% Traveler Match",
    delay: 1.5,
    position: "top-[30%] right-[12%]",
    floatY: [10, -10, 10]
  },
  {
    icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
    title: "Verified Safe Travelers",
    delay: 0.5,
    position: "bottom-[40%] left-[8%]",
    floatY: [-15, 5, -15]
  },
  {
    icon: <Map className="w-4 h-4 text-purple-400" />,
    title: "Smart Multi-City Itinerary",
    delay: 2,
    position: "bottom-[35%] right-[10%]",
    floatY: [15, -5, 15]
  }
];

export function FloatingFeatures() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden md:block">
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${feature.position} flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: feature.floatY
          }}
          transition={{ 
            opacity: { duration: 1, delay: feature.delay },
            scale: { duration: 1, delay: feature.delay, type: "spring" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: feature.delay }
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/5 shadow-inner">
            {feature.icon}
          </div>
          <span className="text-sm font-semibold text-gray-200 tracking-wide">
            {feature.title}
          </span>
          {/* Subtle glowing pulse behind the card */}
          <div className="absolute inset-0 -z-10 bg-white/5 rounded-2xl blur-md opacity-50" />
        </motion.div>
      ))}
    </div>
  );
}
