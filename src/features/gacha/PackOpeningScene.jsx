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
  const [imageError, setImageError] = useState(false);
  
  const { playHover, playClick, playHitReveal, playPackTear } = useAudio();

  const handleTearPack = () => {
    if (phase !== 'pack') return;
    playPackTear();
    setPhase('tearing');
    // After tearing animation, start shooting cards
    setTimeout(() => {
      setPhase('opening');
    }, 500); 
  };

  useEffect(() => {
    if (phase === 'opening') {
      // Calculate how long it takes for all cards to finish their staggered entry
      // Base delay = cards.length * 150ms + spring animation duration (~500ms)
      const timer = setTimeout(() => {
        setCardsLanded(true);
      }, cards.length * 150 + 600);
      return () => clearTimeout(timer);
    }
  }, [phase, cards.length]);

  const handleCardInteraction = () => {
    if (!cardsLanded) return; // Block interaction until all cards land
    
    if (flippedIndex === currentIndex) {
      // 3. Swipe away
      if (currentIndex < cards.length - 1) {
        playClick();
        setCurrentIndex(prev => prev + 1);
      } else {
        playClick();
        setTimeout(() => setPhase('summary'), 400); 
      }
    } else {
      // 2. Reveal interaction
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
    // Find the next hit after the current index
    const nextHitIndex = cards.findIndex((c, idx) => idx > currentIndex && ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(c.rarity));
    
    if (nextHitIndex !== -1) {
      playClick();
      setCurrentIndex(nextHitIndex);
    } else {
      playClick();
      setPhase('summary');
    }
  };

  if (phase === 'summary') {
    return <PullSummary cards={cards} onClose={onClose} />;
  }

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
      
      {/* Botón de Skip en la esquina */}
      {(phase === 'opening' || phase === 'tearing') && (
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={playHover}
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            padding: '12px 32px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 100,
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Skip All ⏩
        </motion.button>
      )}

      <AnimatePresence>
        {(phase === 'pack' || phase === 'tearing') && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={phase === 'pack' ? {
              scale: 1, 
              opacity: 1,
              y: [-10, 10, -10],
              transition: {
                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
              }
            } : {
              scale: [1, 1.1, 0.9, 1.2, 0],
              rotate: [0, -5, 5, -10, 10],
              opacity: [1, 1, 0.5, 0],
              transition: { duration: 0.4 }
            }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="pack-wrapper"
            onClick={handleTearPack}
            onHoverStart={playHover}
            style={{ cursor: phase === 'pack' ? 'pointer' : 'default', position: 'relative', zIndex: 10 }}
          >
            {/* The Pack Artwork */}
            <div style={{ height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {!imageError ? (
                <img 
                  src={`/packs/${pack.id}.jpg`} 
                  alt={pack.name} 
                  style={{ height: '100%', width: 'auto', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', objectFit: 'contain' }} 
                  draggable={false}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div style={{ background: `linear-gradient(135deg, ${pack.color || '#3b82f6'}, #333)`, width: '280px', height: '100%', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {pack.name}
                </div>
              )}
              
              {phase === 'pack' && (
                <div style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  Click to Tear
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'opening' && (
        <div style={{ position: 'relative', width: '350px', height: '490px' }}>
          <AnimatePresence mode="popLayout">
            {cards.map((card, idx) => {
              if (idx < currentIndex) return null; // Elimina las swiped
              
              const isTop = idx === currentIndex;
              const isFlipped = flippedIndex >= idx;
              const isHit = ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(card.rarity);
              const depth = idx - currentIndex;
              
              return (
                <motion.div
                  key={idx}
                  // Step 2 & 3: Shoot out and Stack
                  initial={{ opacity: 0, y: -200, scale: 0.1 }}
                  animate={{ 
                    opacity: 1, 
                    y: depth * 15,
                    scale: 1 - (depth * 0.05),
                    rotateZ: depth % 2 === 0 ? depth * 1.5 : -depth * 1.5,
                    rotateY: isFlipped ? 180 : 0,
                    zIndex: cards.length - idx
                  }}
                  // Swipe out to the left
                  exit={{ x: -800, y: 100, opacity: 0, rotateZ: -45 }}
                  transition={{ 
                    // Initial shoot out is staggered, subsequent updates (flips/depths) are instant springs
                    delay: flippedIndex === -1 && depth === idx ? idx * 0.15 : 0,
                    type: 'spring', 
                    stiffness: isFlipped ? 200 : 400, 
                    damping: isFlipped ? 20 : 30 
                  }}
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    cursor: (isTop && cardsLanded) ? 'pointer' : 'default',
                    transformOrigin: 'center center',
                    transformStyle: 'preserve-3d'
                  }}
                  onClick={isTop ? handleCardInteraction : undefined}
                >
                  
                  {/* Cara Frontal */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    borderRadius: '16px', 
                    boxShadow: `0 15px 35px rgba(0,0,0,0.4), 0 0 25px 2px ${getCardFrontBorderColor(card)}`,
                    overflow: 'hidden', background: '#111',
                    backfaceVisibility: 'hidden', boxSizing: 'border-box',
                    transform: 'rotateY(180deg)'
                  }}>
                    <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.03)' }} draggable={false} />
                    {['RR', 'SR', 'OSR', 'UR', 'OUR', 'HR', 'SEC'].includes(card.rarity) && (
                      <div className={['OSR', 'UR', 'OUR', 'SEC'].includes(card.rarity) ? "foil-overlay foil-cosmic" : "foil-overlay foil-rainbow"} style={{ opacity: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', '--mouse-x': '50%', '--mouse-y': '50%', '--bg-x': '50%', '--bg-y': '50%' }}></div>
                    )}
                  </div>

                  {/* HIT PRE-GLOW */}
                  {isHit && !isFlipped && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5], scale: [1.02, 1.05, 1.02] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
                        background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)',
                        borderRadius: '20px',
                        zIndex: -1,
                        filter: 'blur(8px)',
                        opacity: 0.8
                      }}
                    />
                  )}

                  {/* Reverso Dinámico */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%',
                    borderRadius: '16px', boxShadow: `0 15px 35px rgba(0,0,0,0.4), 0 0 15px 2px ${getCardBorderColor(card)}`,
                    overflow: 'hidden', background: 'linear-gradient(135deg, #1e3a8a, #111827)',
                    backfaceVisibility: 'hidden', boxSizing: 'border-box'
                  }}>
                    {/* Fallback CSS visible si la imagen no carga */}
                    <div style={{ 
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#60a5fa', fontWeight: 'bold', fontSize: '24px', textAlign: 'center', zIndex: 1 
                    }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '14px', marginBottom: '4px', color: '#3b82f6' }}>HOLOLIVE</span>
                        OFFICIAL CARD GAME
                      </div>
                    </div>
                    {/* Imagen del reverso (oculta el fallback si carga bien) */}
                    <img 
                      src={getCardBack(card)} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 2, transform: 'scale(1.05)' }} 
                      draggable={false} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* HIT REVEAL OVERLAY */}
          <AnimatePresence>
            {flippedIndex === currentIndex && currentIndex < cards.length && ['SR', 'UR', 'OUR', 'HR', 'SEC'].includes(cards[currentIndex].rarity) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', top: '-100px', left: '-100px', right: '-100px', bottom: '-100px', pointerEvents: 'none', zIndex: 50 }}
              >
                {/* Rarity Text */}
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                  style={{ position: 'absolute', top: '20px', width: '100%', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '64px', fontWeight: '900', color: '#fbbf24', textShadow: '0 0 30px #f59e0b, 0 4px 15px rgba(0,0,0,0.8)', fontStyle: 'italic', letterSpacing: '6px' }}>
                    {cards[currentIndex].rarity}
                  </div>
                </motion.div>

                {/* Name Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.3 }}
                  style={{ position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.6)', padding: '12px 24px', borderRadius: '30px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)' }}>
                    {cards[currentIndex].name}
                  </div>
                </motion.div>
                
                {/* Glow behind the card */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0.2] }}
                  transition={{ duration: 1 }}
                  style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%', background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)', zIndex: -1 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'absolute', bottom: '-60px', width: '100%', textAlign: 'center', color: '#a1a1aa', fontSize: '18px', opacity: cardsLanded ? 1 : 0, transition: 'opacity 0.3s' }}>
            {flippedIndex === currentIndex ? 'Click to Swipe Left' : 'Click to Reveal'}
          </div>
        </div>
      )}
    </div>
  );
}
