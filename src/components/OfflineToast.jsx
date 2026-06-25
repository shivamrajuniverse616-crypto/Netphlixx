import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function OfflineToast() {
  const isOnline = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[#2a2a2a] text-white px-4 py-3 rounded-full flex items-center shadow-2xl border border-gray-700 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-3">
            <WifiOff className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-medium tracking-wide">You are offline. Browsing cached content.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
