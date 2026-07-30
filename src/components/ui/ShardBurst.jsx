import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShardBurst({ onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate 20 particles
    const newParticles = Array.from({ length: 20 }).map((_, i) => {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 50 + Math.random() * 150; // Random distance between 50 and 200px
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity;
      
      // Randomize color slightly (blue to gold)
      const isGold = Math.random() > 0.7;
      const color = isGold ? '#fbbf24' : '#60a5fa'; // amber-400 or blue-400
      const shadowColor = isGold ? 'rgba(251, 191, 36, 0.8)' : 'rgba(96, 165, 250, 0.8)';
      
      return {
        id: i,
        x,
        y,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 1.5,
        color,
        shadowColor
      };
    });

    setParticles(newParticles);

    // Clean up particles and notify parent after animation (1s)
    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 100 }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{ 
              x: p.x, 
              y: p.y, 
              opacity: 0, 
              scale: p.scale, 
              rotate: p.rotation 
            }}
            transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.shadowColor}, 0 0 20px ${p.shadowColor}`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Diamond shape
              transformOrigin: 'center'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
