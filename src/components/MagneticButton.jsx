import React, { useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function MagneticButton({ children, className = '', onClick, type = "button" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });
  
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const pullX = ((e.clientX - centerX) / width) * 15; 
    const pullY = ((e.clientY - centerY) / height) * 15;
    x.set(pullX);
    y.set(pullY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - rect.left;
    const rippleY = e.clientY - rect.top;
    setRipples(prev => [...prev, { x: rippleX, y: rippleY, id: Date.now() }]);
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`relative overflow-hidden outline-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      whileTap={{ scale: 0.90, opacity: 0.8 }} // Changed for better touch feedback
      whileHover={{ scale: 1.05 }}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))}
          className="absolute rounded-full bg-white pointer-events-none z-0"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: Math.max(100, 100),
            height: Math.max(100, 100),
            marginLeft: -50,
            marginTop: -50,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center w-full h-full">{children}</span>
    </motion.button>
  );
}
