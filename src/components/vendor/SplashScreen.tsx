import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDuration = 1400,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onComplete, 400); // Allow fade out exit animation
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-4 select-none cursor-pointer"
          onClick={handleDismiss}
        >
          {/* Subtle background radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,150,57,0.08)_0%,_rgba(255,255,255,1)_70%)] pointer-events-none" />

          <div className="relative flex flex-col items-center max-w-sm text-center">
            {/* Logo Container with Scale & Fade */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative p-3 mb-6"
            >
              <img
                src="/logo.png"
                alt="Vaduthala Hyper Shopee"
                className="w-48 sm:w-56 h-auto object-contain drop-shadow-md"
              />
            </motion.div>

            {/* Title & Tagline with staggered animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold tracking-wide border border-emerald-100">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>VENDOR CONTROL PORTAL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
                Vaduthala Hyper Shopee
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs font-normal">
                Official Supplier Registration & Procurement Gateway
              </p>
            </motion.div>

            {/* Animated Loading Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '140px' }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="h-1 bg-slate-100 rounded-full overflow-hidden mt-8"
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                className="h-full w-1/2 bg-emerald-600 rounded-full"
              />
            </motion.div>

            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-700 transition-colors py-1.5 px-3 rounded-full hover:bg-slate-50"
            >
              <span>Tap anywhere or press</span>
              <span className="font-semibold text-slate-600">Skip</span>
              <ArrowRight className="w-3 h-3" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
