import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { getCardFrontBorderColor } from '../../utils/cardUtils';

export default function Card3D({ card, count }) {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    x.set(0);
    y.set(0);
  };

  const bgX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const bgY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);

  const isFoil = ['RR', 'SR', 'OSR', 'UR', 'OUR', 'SEC'].includes(card.rarity);

  return (
    <div style={{ position: 'relative', width: '200px', height: '280px', perspective: '1000px' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          borderRadius: '12px',
          boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px 2px ${getCardFrontBorderColor(card)}`,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#222'
        }}
      >
        <img 
          src={card.image_url} 
          alt={card.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          loading="lazy"
          onError={(e) => { 
            // Phase 4 Local Fallback for Cheer Cards
            if (card.card_type === 'Cheer' && card.attributes && card.attributes.color && card.attributes.color.length > 0) {
              const color = card.attributes.color[0].toLowerCase();
              const localPath = `/cards/cheer-${color}.png`;
              if (e.target.src.indexOf(localPath) === -1) {
                e.target.src = localPath;
                return;
              }
            }
            
            console.warn('Missing image for card ID:', card.id);
            e.target.style.display = 'none'; 
            if (e.target.nextSibling && e.target.nextSibling.classList.contains('fallback-ui')) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
        <div className="fallback-ui" style={{ 
          display: 'none', 
          width: '100%', 
          height: '100%', 
          background: '#27272a', 
          color: '#ef4444', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '16px',
          textAlign: 'center',
          border: '1px solid #3f3f46',
          borderRadius: '12px',
          boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Image Missing</span>
          <span style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>{card.id}</span>
        </div>

        {card.rarity && card.rarity !== 'Unknown' && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {card.rarity}
          </div>
        )}
        {isFoil && (
          <motion.div 
            className={['OSR', 'UR', 'OUR', 'SEC'].includes(card.rarity) ? "foil-overlay foil-cosmic" : "foil-overlay foil-rainbow"} 
            style={{ 
              opacity: isHovering ? 1 : 0, 
              position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0, 
              pointerEvents: 'none',
              '--mouse-x': bgX,
              '--mouse-y': bgY,
              '--bg-x': bgX,
              '--bg-y': bgY
            }}
          />
        )}
      </motion.div>
      {count > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '-12px',
          right: '-12px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          zIndex: 10
        }}>
          {count}
        </div>
      )}
    </div>
  );
}
