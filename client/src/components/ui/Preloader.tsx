import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, duration = 1800 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] select-none cyber-grid-bg overflow-hidden"
        >
          {/* Spatial Grid Scan Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Expanding radial scan circle */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.8 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-400/40"
            />
            {/* Horizontal scan line */}
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_15px_rgba(0,240,255,0.8)]"
            />
          </div>

          {/* Central Logo & Parallel Paths Symbol */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Isometric Parallel Diverging Paths Symbol */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 100" fill="none">
                {/* 3D Wireframe Hex Grid */}
                <polygon
                  points="50,10 88,32 88,78 50,98 12,78 12,32"
                  stroke="#1e293b"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Parallel Paths diverging */}
                <motion.path
                  d="M50,90 L50,55 L25,30"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M50,90 L50,55 L75,30"
                  stroke="#8b5cf6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                />
                {/* Decision Junction Pulse */}
                <circle cx="50" cy="55" r="4.5" fill="#00f0ff" className="animate-ping" />
                <circle cx="50" cy="55" r="3" fill="#ffffff" />
              </svg>
            </div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 font-mono"
            >
              PREVIA XR
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm md:text-base font-medium text-cyan-300 tracking-wider mt-2 uppercase font-mono"
            >
              Preview Before You Act.
            </motion.p>

            {/* Sub-bar */}
            <div className="w-48 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
