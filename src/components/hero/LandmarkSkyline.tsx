import { motion } from 'framer-motion';

export function LandmarkSkyline() {
  return (
    <div className="absolute bottom-0 w-full h-[400px] pointer-events-none z-10 overflow-hidden">
      {/* Base Skyline Image (Cinematic Silhouette or Vector) */}
      <div className="absolute bottom-0 w-full h-full flex justify-center items-end opacity-80">
        <img 
          src="https://img.freepik.com/free-vector/world-landmarks-skyline-silhouette-illustration_1017-31358.jpg?w=1800" 
          alt="World Landmarks Skyline" 
          className="w-full object-cover mix-blend-screen opacity-50 object-bottom min-h-[300px]"
          style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.5) contrast(1.2)' }}
        />
      </div>

      {/* Floating Hot Air Balloons */}
      <motion.div
        className="absolute bottom-[200px] left-[15%] w-8 h-10 opacity-70"
        animate={{
          y: [-10, -40, -10],
          x: [-5, 10, -5],
          rotate: [-5, 5, -5]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="1.5">
          <path d="M12 2C8.686 2 6 4.686 6 8c0 3.882 3.111 6.518 5 9 0.443 0.582 1.557 0.582 2 0 1.889-2.482 5-5.118 5-9 0-3.314-2.686-6-6-6z" fill="#f59e0b" stroke="none" opacity="0.8" />
          <path d="M10 20h4v2h-4v-2z" fill="#b45309" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-[250px] right-[25%] w-6 h-8 opacity-50"
        animate={{
          y: [0, -50, 0],
          x: [0, -15, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5">
          <path d="M12 2C8.686 2 6 4.686 6 8c0 3.882 3.111 6.518 5 9 0.443 0.582 1.557 0.582 2 0 1.889-2.482 5-5.118 5-9 0-3.314-2.686-6-6-6z" fill="#3b82f6" stroke="none" opacity="0.8" />
          <path d="M10 20h4v2h-4v-2z" fill="#1e3a8a" />
        </svg>
      </motion.div>

      {/* Animated Airplane */}
      <motion.div
        className="absolute top-[50px] right-[-10%]"
        animate={{
          x: [0, -window.innerWidth * 1.2],
          y: [0, window.innerHeight * 0.2]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
      >
        <svg className="w-6 h-6 text-emerald-400 rotate-[-15deg] opacity-70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </motion.div>

      {/* Cloud Layers */}
      <motion.div
        className="absolute bottom-0 w-full h-[150px] bg-gradient-to-t from-[#020617] to-transparent z-20"
      />
    </div>
  );
}
