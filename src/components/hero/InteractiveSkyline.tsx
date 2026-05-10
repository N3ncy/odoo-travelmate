import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

export function InteractiveSkyline() {
  const eiffelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle shimmering glow for the center of the skyline (simulating Eiffel Tower / city lights)
    if (eiffelRef.current) {
      gsap.to(eiffelRef.current, {
        opacity: 0.6,
        scale: 1.02,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  return (
    <div className="absolute bottom-0 w-full h-[300px] pointer-events-none z-0 overflow-hidden">
      
      {/* Heavy Top Fade to melt skyline into the background */}
      <div className="absolute top-0 w-full h-[150px] bg-gradient-to-b from-[#020617] to-transparent z-20" />

      {/* Base Skyline Silhouette (Desaturated, darker, lowered opacity) */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.25 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-0 w-full h-full flex justify-center items-end"
      >
        <img 
          src="https://img.freepik.com/free-vector/world-landmarks-skyline-silhouette-illustration_1017-31358.jpg?w=1800" 
          alt="World Landmarks" 
          className="w-full object-cover mix-blend-screen object-bottom min-h-[200px] grayscale"
          style={{ filter: 'invert(1) brightness(0.8) contrast(1.2)' }}
        />
        
        {/* Shimmering Center Light (Eiffel Tower glow simulation) */}
        <div 
          ref={eiffelRef}
          className="absolute bottom-[50px] left-[50%] -translate-x-1/2 w-24 h-48 bg-emerald-500/10 blur-[50px] rounded-full"
        />
      </motion.div>

      {/* Atmospheric Ground Fog / Gradient Overlay */}
      <div className="absolute bottom-0 w-full h-[150px] bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent z-20" />
    </div>
  );
}
