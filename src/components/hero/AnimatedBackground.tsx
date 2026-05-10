import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020617]">
      {/* Dynamic Gradient Mesh */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-900/40 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/40 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute bottom-[0%] left-[20%] w-[80%] h-[80%] rounded-full bg-teal-900/30 blur-[150px]"
      />

      {/* World Map SVG Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-center bg-no-repeat bg-contain"
        style={{
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")',
          filter: 'invert(1)'
        }}
      />

      {/* Connected AI Route Nodes */}
      <svg className="absolute inset-0 w-full h-full opacity-60">
        <defs>
          <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Route 1 */}
        <motion.path
          d="M 200 400 Q 400 200 600 300 T 900 250"
          fill="transparent"
          stroke="url(#routeGrad1)"
          strokeWidth="2"
          strokeDasharray="8 8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
          filter="url(#glow)"
        />
        
        {/* Node 1 */}
        <motion.circle
          cx="600" cy="300" r="4" fill="#34d399"
          animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          filter="url(#glow)"
        />

        {/* Route 2 */}
        <motion.path
          d="M 800 600 Q 1000 400 1200 500 T 1400 450"
          fill="transparent"
          stroke="url(#routeGrad1)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse", delay: 1 }}
        />
      </svg>

      {/* Floating Particles (Simulating AI computation) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-teal-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            opacity: [null, Math.random() * 0.8 + 0.2, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ boxShadow: '0 0 10px 2px rgba(45, 212, 191, 0.3)' }}
        />
      ))}
    </div>
  );
}
