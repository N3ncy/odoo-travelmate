import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export function AnimatedWorldMap() {
  const pathRef1 = useRef<SVGPathElement>(null);
  const pathRef2 = useRef<SVGPathElement>(null);
  const nodeRef1 = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // GSAP path drawing animation
    if (pathRef1.current) {
      const length = pathRef1.current.getTotalLength();
      gsap.set(pathRef1.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(pathRef1.current, {
        strokeDashoffset: 0,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
    
    if (pathRef2.current) {
      const length = pathRef2.current.getTotalLength();
      gsap.set(pathRef2.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(pathRef2.current, {
        strokeDashoffset: 0,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 2
      });
    }

    if (nodeRef1.current) {
      gsap.to(nodeRef1.current, {
        attr: { r: 6 },
        opacity: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Warm Golden Atmospheric Gradients */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-amber-200/40 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-300/30 blur-[150px]"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute bottom-[20%] left-[10%] w-[70%] h-[70%] rounded-full bg-yellow-200/40 blur-[150px]"
      />

      {/* High-res World Map SVG Layer (Warm tint) */}
      <div 
        className="absolute inset-0 opacity-[0.25] bg-center bg-no-repeat bg-contain transform scale-110"
        style={{
          backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")',
          filter: 'sepia(1) hue-rotate(-30deg) saturate(2) opacity(0.4)' // Creates a golden/brown tint
        }}
      />

      {/* Global GSAP Routes (Warm glow) */}
      <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path
          ref={pathRef1}
          d="M 100 300 Q 400 150 700 350 T 1300 200"
          fill="transparent"
          stroke="url(#glowLine)"
          strokeWidth="2"
          filter="url(#neonGlow)"
        />
        
        <path
          ref={pathRef2}
          d="M 200 600 Q 600 400 900 550 T 1500 400"
          fill="transparent"
          stroke="url(#glowLine)"
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />

        <circle
          ref={nodeRef1}
          cx="700" cy="350" r="2" fill="#10b981" opacity="0.6"
          filter="url(#neonGlow)"
        />
      </svg>

      {/* Upward Drifting Sparkles (Warm light) */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            boxShadow: '0 0 12px 2px rgba(251, 191, 36, 0.6)'
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: -Math.random() * 200 - 50,
            opacity: [0, Math.random() * 0.8 + 0.2, 0]
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}
    </div>
  );
}
