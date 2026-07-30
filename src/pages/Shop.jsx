import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { useInventoryStore } from '../store/useInventoryStore';
import PackOpeningScene from '../features/gacha/PackOpeningScene';
import { generateSinglePack, generateBox } from '../lib/gacha-engine';
import { EXPANSIONS } from '../utils/expansions';
import { EXPANSION_THEMES } from '../utils/expansionThemes';
import { useAudio } from '../hooks/useAudio';
import cardsData from '../data/cards.json';
import '../features/gacha/gacha.css';

const AVAILABLE_PACKS = [
  { id: 'hBP01', name: EXPANSIONS.hBP01, singlePrice: 100, boxPrice: 1200 },
  { id: 'hBP02', name: EXPANSIONS.hBP02, singlePrice: 100, boxPrice: 1200 },
  { id: 'hBP03', name: EXPANSIONS.hBP03, singlePrice: 100, boxPrice: 1200 },
  { id: 'hBP04', name: EXPANSIONS.hBP04, singlePrice: 100, boxPrice: 1200 },
  { id: 'hBP05', name: EXPANSIONS.hBP05, singlePrice: 100, boxPrice: 1200 },
  { id: 'hBP06', name: EXPANSIONS.hBP06, singlePrice: 100, boxPrice: 1200 }
];

export default function Shop() {
  const credits = usePlayerStore(state => state.credits);
  const spendCredits = usePlayerStore(state => state.spendCredits);
  const recordPackOpened = usePlayerStore(state => state.recordPackOpened);
  const devMode = usePlayerStore(state => state.devMode);
  
  const addCardsToCollection = useInventoryStore(state => state.addCardsToCollection);
  const activeBoxes = useInventoryStore(state => state.activeBoxes);
  const addBox = useInventoryStore(state => state.addBox);
  const openPackFromBoxStore = useInventoryStore(state => state.openPackFromBox);
  
  const [openingPack, setOpeningPack] = useState(null);
  const [pulledCards, setPulledCards] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState(AVAILABLE_PACKS[0].id);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { playHover, playClick, playPackTear } = useAudio();

  const selectedPack = AVAILABLE_PACKS.find(p => p.id === selectedPackId);
  const theme = EXPANSION_THEMES[selectedPackId] || EXPANSION_THEMES.default;

  // Extract hits for the carousel
  const carouselHits = useMemo(() => {
    return cardsData
      .filter(c => c.expansion_id === selectedPackId && ['SEC', 'OUR', 'UR', 'HR'].includes(c.rarity))
      .slice(0, 10); // Take top 10 hits to prevent huge dom trees
  }, [selectedPackId]);

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselHits.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselHits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselHits]);

  const handleBuySinglePack = () => {
    playClick();
    if (spendCredits(selectedPack.singlePrice)) {
      playPackTear();
      const cards = generateSinglePack(selectedPack.id);
      setPulledCards(cards);
      setOpeningPack(selectedPack);
      addCardsToCollection(cards);
      recordPackOpened(1);
    } else {
      alert("Not enough credits!");
    }
  };

  const handleBuyBox = () => {
    playClick();
    if (spendCredits(selectedPack.boxPrice)) {
      const packs = generateBox(selectedPack.id);
      addBox(selectedPack.id, packs);
    } else {
      alert("Not enough credits!");
    }
  };
  
  const handleOpenPackFromBox = () => {
    playClick();
    const cards = openPackFromBoxStore(selectedPack.id);
    if (cards) {
      playPackTear();
      setPulledCards(cards);
      setOpeningPack(selectedPack);
      addCardsToCollection(cards);
      recordPackOpened(1);
    }
  };

  if (openingPack) {
    return (
      <PackOpeningScene 
        pack={openingPack} 
        cards={pulledCards} 
        onClose={() => setOpeningPack(null)} 
      />
    );
  }

  const boxesForPack = activeBoxes[selectedPack.id] || [];
  const remainingPacks = boxesForPack.length;

  return (
    <motion.div 
      className="page-container"
      animate={{ background: theme.gradient }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        overflowY: 'auto', padding: '32px'
      }}
    >
      <h1 className="page-title" style={{ position: 'relative', zIndex: 10, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Booster Shop</h1>
      
      {/* EXPANSION SELECTOR */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', position: 'relative', zIndex: 10 }}>
        {AVAILABLE_PACKS.map(pack => (
          <motion.button
            key={pack.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={playHover}
            onClick={() => {
              playClick();
              setSelectedPackId(pack.id);
              setCarouselIndex(0);
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '24px',
              border: `2px solid ${selectedPackId === pack.id ? theme.accent : 'rgba(255,255,255,0.1)'}`,
              background: selectedPackId === pack.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.5)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedPackId === pack.id ? `0 0 20px ${theme.glowColor}` : 'none',
              transition: 'border 0.3s, background 0.3s'
            }}
          >
            {pack.name}
          </motion.button>
        ))}
      </div>

      {/* SHOWCASE CAROUSEL & PURCHASE PANEL */}
      <div style={{ display: 'flex', flex: 1, marginTop: '24px', gap: '48px', position: 'relative', zIndex: 10 }}>
        
        {/* CAROUSEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          {(() => {
            if (carouselHits.length === 0) return null;
            
            // Calculate 3 distinct indices
            const idx1 = carouselIndex % carouselHits.length;
            const idx2 = (carouselIndex + 1) % carouselHits.length;
            const idx3 = (carouselIndex + 2) % carouselHits.length;
            
            const renderCard = (card, position) => {
              if (!card) return null;
              const isCenter = position === 'center';
              const rotationY = position === 'left' ? 25 : position === 'right' ? -25 : 0;
              const translateY = isCenter ? 0 : 20; // Push side cards down slightly
              
              return (
                <div key={position} style={{ 
                  position: 'relative', 
                  width: isCenter ? '260px' : '200px', 
                  height: isCenter ? '364px' : '280px', 
                  transformStyle: 'preserve-3d',
                  transform: `perspective(1000px) rotateY(${rotationY}deg) translateY(${translateY}px)`,
                  zIndex: isCenter ? 10 : 1,
                  transition: 'width 0.5s, height 0.5s' // Smooth resize if window changes
                }}>
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={card.id} // Re-animates when card changes
                      initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                      exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: '16px',
                        boxShadow: isCenter ? `0 20px 50px ${theme.glowColor}` : '0 10px 30px rgba(0,0,0,0.8)',
                        background: '#111',
                        overflow: 'hidden'
                      }}
                    >
                      <img 
                        src={card.image_url} 
                        alt="Chase Hit" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, 
                        padding: isCenter ? '16px' : '10px', 
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                        display: 'flex', justifyContent: isCenter ? 'space-between' : 'flex-end', alignItems: 'flex-end'
                      }}>
                        {isCenter && <span style={{ fontWeight: 'bold', color: theme.accent, fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>CHASE CARD</span>}
                        <span style={{ fontWeight: 'bold', background: theme.accent, color: 'black', padding: '2px 8px', borderRadius: '8px', fontSize: isCenter ? '14px' : '12px' }}>
                          {card.rarity}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            };

            return (
              <>
                {renderCard(carouselHits[idx1], 'left')}
                {renderCard(carouselHits[idx2], 'center')}
                {renderCard(carouselHits[idx3], 'right')}
              </>
            );
          })()}
        </div>

        {/* PURCHASE PANEL */}
        <div style={{ width: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: `4px solid ${theme.accent}` }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              {selectedPack.name}
            </h2>

            {remainingPacks > 0 ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={playHover}
                onClick={handleOpenPackFromBox}
                className="btn-primary"
                style={{ background: theme.accent, color: 'black', height: '60px', fontSize: '18px', boxShadow: `0 0 20px ${theme.glowColor}` }}
              >
                Open Pack from Box ({remainingPacks} left)
              </motion.button>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a1a1aa' }}>Single Pack</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: theme.accent }}>{selectedPack.singlePrice} CR</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={playHover}
                    onClick={handleBuySinglePack}
                    disabled={credits < selectedPack.singlePrice && !devMode}
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${theme.accent}` }}
                  >
                    Buy 1 Pack
                  </motion.button>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a1a1aa' }}>Booster Box (12 Packs)</span>
                    <span style={{ fontWeight: 'bold', fontSize: '18px', color: theme.accent }}>{selectedPack.boxPrice} CR</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={playHover}
                    onClick={handleBuyBox}
                    disabled={credits < selectedPack.boxPrice && !devMode}
                    className="btn-primary"
                    style={{ background: theme.accent, color: 'black', boxShadow: `0 0 20px ${theme.glowColor}` }}
                  >
                    Buy Box
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
