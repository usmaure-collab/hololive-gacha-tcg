import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PullSummary from './PullSummary';
import { getCardBack, getCardBorderColor, getCardFrontBorderColor } from '../../utils/cardUtils';
import { useAudio } from '../../hooks/useAudio';

export default function PackOpeningScene({ pack, cards, onClose }) {
  const [phase, setPhase] = useState('pack'); // 'pack', 'tearing', 'opening', 'summary'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(-1);
  const [cardsLanded, setCardsLanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { playHover, playClick, playHitReveal, playPackTear } = useAudio();

  const handleMouseMove = (e) => {
    if (phase !== 'pack') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleTearPack = () => {
    if (phase !== 'pack') return;
    playPackTear();
    setPhase('tearing');
    // Start showing cards almost immediately while pack tears
    setTimeout(() => {
      setPhase('opening');
    }, 400); 
  };

  useEffect(() => {
    if (phase === 'opening') {
      const timer = setTimeout(() => {
        setCardsLanded(true);
      }, cards.length * 150 + 600);
      return () => clearTimeout(timer);
    }
  }, [phase, cards.length]);

  const handleCardInteraction = () => {
    if (!cardsLanded) return; 
    
    if (flippedIndex === currentIndex) {
      if (currentIndex < cards.length - 1) {
        playClick();
        setCurrentIndex(prev => prev + 1);
      } else {
        playClick();
        setTimeout(() => setPhase('summary'), 400); 
      }
    } else {
      const card = cards[currentIndex];
      if (['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(card.rarity)) {
        playHitReveal();
      } else {
        playClick();
      }
      setFlippedIndex(currentIndex);
    }
  };

  const handleSkip = () => {
    const nextHitIndex = cards.findIndex((c, idx) => idx > flippedIndex && ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(c.rarity));
    if (nextHitIndex !== -1) {
      if (currentIndex === nextHitIndex) {
        playHitReveal();
        setFlippedIndex(nextHitIndex);
      } else {
        playClick();
        setCurrentIndex(nextHitIndex);
      }
    } else {
      playClick();
      setPhase('summary');
    }
  };

  if (phase === 'summary') {
    return <PullSummary cards={cards} onClose={onClose} />;
  }

  // 15% tear line
  const TEAR_PERCENT = 15;
  const packImageUrl = `/packs/${pack.id}.jpg`;

  return (
    <div className="opening-scene" style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', width: '100vw', overflow: 'hidden', background: '#09090b', 
      perspective: '1200px',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative'
    }}>
      
      {(phase === 'opening' || phase === 'tearing') && (
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={playHover}
          onClick={handleSkip}
          style={{
            position: 'absolute', bottom: '40px', right: '40px', padding: '12px 32px',
            borderRadius: '24px', background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white',
            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 100, transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Skip All ⏩
        </motion.button>
      )}

      {/* Pseudo-3D Pack Tear Animation */}
      <AnimatePresence>
        {(phase === 'pack' || phase === 'tearing' || phase === 'opening') && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleTearPack}
            onHoverStart={playHover}
            style={{ 
              position: 'absolute', zIndex: 20,
              width: '280px', height: '480px',
              cursor: phase === 'pack' ? 'pointer' : 'default',
              // Hover physics for 2.5D feel
              rotateX: phase === 'pack' ? mousePos.y * -20 : 0,
              rotateY: phase === 'pack' ? mousePos.x * 20 : 0,
              y: phase === 'pack' ? [-10, 10, -10] : 0,
              pointerEvents: phase === 'pack' ? 'auto' : 'none'
            }}
            transition={phase === 'pack' ? {
              y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
              rotateX: { type: 'spring', stiffness: 300, damping: 20 },
              rotateY: { type: 'spring', stiffness: 300, damping: 20 }
            } : {}}
          >
            {/* Top Piece (Tear Strip) */}
            <motion.div
              initial={false}
              animate={phase === 'pack' ? { y: 0, rotateZ: 0, opacity: 1 } : { y: -200, rotateZ: 45, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url(${packImageUrl})`,
                backgroundSize: '100% 100%',
                clipPath: `polygon(0 0, 100% 0, 100% ${TEAR_PERCENT}%, 0 ${TEAR_PERCENT}%)`,
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                zIndex: 22
              }}
            >
              {/* Metallic Foil Reflection */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(135deg, rgba(255,255,255,0) ${40 + mousePos.x * 50}%, rgba(255,255,255,0.4) ${50 + mousePos.x * 50}%, rgba(255,255,255,0) ${60 + mousePos.x * 50}%)`,
                transition: 'background 0.1s'
              }} />
            </motion.div>

            {/* Bottom Piece (Body) */}
            <motion.div
              initial={false}
              animate={(phase === 'pack' || phase === 'tearing') ? { y: 0, opacity: 1 } : { y: 400, opacity: 0, rotateZ: -10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: phase === 'opening' ? 0.3 : 0 }}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url(${packImageUrl})`,
                backgroundSize: '100% 100%',
                clipPath: `polygon(0 ${TEAR_PERCENT}%, 100% ${TEAR_PERCENT}%, 100% 100%, 0 100%)`,
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                zIndex: 21
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: `linear-gradient(135deg, rgba(255,255,255,0) ${40 + mousePos.x * 50}%, rgba(255,255,255,0.4) ${50 + mousePos.x * 50}%, rgba(255,255,255,0) ${60 + mousePos.x * 50}%)`,
                transition: 'background 0.1s'
              }} />
            </motion.div>

            {/* Particle Burst / Bright Flash at seam line */}
            <AnimatePresence>
              {phase === 'tearing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, height: '2px' }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 2], height: ['2px', '40px', '100px'] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute', top: `${TEAR_PERCENT}%`, left: '-20%', width: '140%',
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)',
                    transform: 'translateY(-50%)',
                    zIndex: 25,
                    pointerEvents: 'none',
                    filter: 'blur(4px)',
                    mixBlendMode: 'screen'
                  }}
                />
              )}
            </AnimatePresence>
            
            {phase === 'pack' && (
              <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.8)', zIndex: 30, pointerEvents: 'none' }}>
                Click to Tear
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards container - positioned behind the pack during tearing/opening */}
      {(phase === 'tearing' || phase === 'opening') && (
        <div style={{ position: 'absolute', width: '350px', height: '490px', zIndex: 15 }}>
          <AnimatePresence mode="popLayout">
            {cards.map((card, idx) => {
              if (idx < currentIndex) return null; 
              
              const isTop = idx === currentIndex;
              const isFlipped = flippedIndex >= idx;
              const isHit = ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(card.rarity);
              const depth = idx - currentIndex;
              
              return (
                <motion.div
                  key={idx}
                  // Start behind the bottom piece, then slide up and stack
                  initial={{ opacity: 0, y: 100, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    y: phase === 'tearing' ? 50 : depth * 15,
                    scale: phase === 'tearing' ? 0.8 : 1 - (depth * 0.05),
                    rotateZ: phase === 'tearing' ? 0 : (depth % 2 === 0 ? depth * 1.5 : -depth * 1.5),
                    rotateY: isFlipped ? 180 : 0,
                    zIndex: cards.length - idx
                  }}
                  exit={{ x: -800, y: 100, opacity: 0, rotateZ: -45 }}
                  transition={{ 
                    delay: phase === 'opening' && flippedIndex === -1 && depth === idx ? idx * 0.15 : 0,
                    type: 'spring', stiffness: isFlipped ? 200 : 400, damping: isFlipped ? 20 : 30 
                  }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    cursor: (isTop && cardsLanded && phase === 'opening') ? 'pointer' : 'default',
                    transformOrigin: 'center center',
                    transformStyle: 'preserve-3d'
                  }}
                  onClick={isTop && phase === 'opening' ? handleCardInteraction : undefined}
                >
                  {/* Front */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', borderRadius: '16px', 
                    boxShadow: `0 15px 35px rgba(0,0,0,0.4), 0 0 25px 2px ${getCardFrontBorderColor(card)}`,
                    overflow: 'hidden', background: '#111', backfaceVisibility: 'hidden', boxSizing: 'border-box',
                    transform: 'rotateY(180deg)'
                  }}>
                    <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.03)' }} draggable={false} />
                    {['RR', 'SR', 'OSR', 'UR', 'OUR', 'HR', 'SEC'].includes(card.rarity) && (
                      <div className={['OSR', 'UR', 'OUR', 'SEC'].includes(card.rarity) ? "foil-overlay foil-cosmic" : "foil-overlay foil-rainbow"} style={{ opacity: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', '--mouse-x': '50%', '--mouse-y': '50%', '--bg-x': '50%', '--bg-y': '50%' }}></div>
                    )}
                  </div>

                  {/* Hit Pre-glow */}
                  {isHit && !isFlipped && phase === 'opening' && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5], scale: [1.02, 1.05, 1.02] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
                        background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)',
                        borderRadius: '20px', zIndex: -1, filter: 'blur(8px)', opacity: 0.8
                      }}
                    />
                  )}

                  {/* Back */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    borderRadius: '16px', boxShadow: `0 15px 35px rgba(0,0,0,0.4), 0 0 15px 2px ${getCardBorderColor(card)}`,
                    overflow: 'hidden', background: 'linear-gradient(135deg, #1e3a8a, #111827)',
                    backfaceVisibility: 'hidden', boxSizing: 'border-box'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 'bold', fontSize: '24px', textAlign: 'center', zIndex: 1 }}>
                      <div><span style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#3b82f6' }}>HOLOLIVE</span>OFFICIAL CARD GAME</div>
                    </div>
                    <img src={getCardBack(card)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 2, transform: 'scale(1.05)' }} draggable={false} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          <AnimatePresence>
            {flippedIndex === currentIndex && currentIndex < cards.length && ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(cards[currentIndex].rarity) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: '-100px', left: '-100px', right: '-100px', bottom: '-100px', pointerEvents: 'none', zIndex: 50 }}
              >
                <motion.div initial={{ opacity: 0, y: 50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }} style={{ position: 'absolute', top: '20px', width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', fontWeight: '900', color: '#fbbf24', textShadow: '0 0 30px #f59e0b, 0 4px 15px rgba(0,0,0,0.8)', fontStyle: 'italic', letterSpacing: '6px' }}>{cards[currentIndex].rarity}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: -50, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.3 }} style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.6)', padding: '12px 24px', borderRadius: '30px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)' }}>{cards[currentIndex].name}</div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0.2] }} transition={{ duration: 1 }} style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)', zIndex: -1 }} />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'absolute', bottom: '-60px', width: '100%', textAlign: 'center', color: '#a1a1aa', fontSize: '18px', opacity: (cardsLanded && phase === 'opening') ? 1 : 0, transition: 'opacity 0.3s' }}>
            {flippedIndex === currentIndex ? 'Click to Swipe Left' : 'Click to Reveal'}
          </div>
        </div>
      )}
    </div>
  );
}
