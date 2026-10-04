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
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F7F8FA] select-none spatial-grid-bg overflow-hidden"
        >
          {/* Subtle Spatial Pulse Effect */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className="w-72 h-72 rounded-full border border-blue-400/20"
            />
          </div>

          {/* Central Logo & Architectural Spatial Symbol */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Geometric Spatial Node Symbol */}
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center bg-white rounded-2xl border border-[#E2E5E9] shadow-sm p-4">
              <svg className="w-full h-full text-[#2563EB]" viewBox="0 0 100 100" fill="none">
                {/* Architectural blueprint box */}
                <polygon
                  points="50,12 88,34 88,76 50,96 12,76 12,34"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  fill="none"
                />
                {/* Decision Paths diverging */}
                <motion.path
                  d="M50,86 L50,52 L26,32"
                  stroke="#2563EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: 'easeInOut' }}
                />
                <motion.path
                  d="M50,86 L50,52 L74,32"
                  stroke="#14B8A6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.0, ease: 'easeInOut', delay: 0.2 }}
                />
                {/* Decision Junction Marker */}
                <circle cx="50" cy="52" r="4.5" fill="#2563EB" />
                <circle cx="50" cy="52" r="2" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-3xl md:text-4xl font-black tracking-wider text-[#172033]"
            >
              PREVIA <span className="text-[#2563EB]">XR</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-xs md:text-sm font-semibold text-[#667085] tracking-widest mt-2 uppercase"
            >
              Spatial Decision Intelligence
            </motion.p>

            {/* Clean Progress Indicator */}
            <div className="w-40 h-1 bg-[#E2E5E9] rounded-full mt-6 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-[#2563EB]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
