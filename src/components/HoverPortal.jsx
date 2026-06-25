import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

export default function HoverPortal({ children, coordinates, isHovered, onMouseLeave }) {
  useEffect(() => {
    if (isHovered) {
      const handleScroll = () => onMouseLeave();
      window.addEventListener('wheel', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('touchmove', handleScroll);
      };
    }
  }, [isHovered, onMouseLeave]);

  if (!isHovered || !coordinates) return null;
  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1.15 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed z-[999] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#0a0a0c] overflow-hidden"
      style={{
        top: coordinates.top - 20,
        left: coordinates.left - 20,
        width: coordinates.width + 40,
        height: 'auto',
      }}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>,
    document.body
  );
}
