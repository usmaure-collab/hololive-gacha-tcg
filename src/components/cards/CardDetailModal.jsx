import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { useEconomyStore, getRatesForRarity } from '../../store/useEconomyStore';
import { useInventoryStore } from '../../store/useInventoryStore';

export default function CardDetailModal({ card, onClose }) {
  const holoShards = useEconomyStore(state => state.holoShards);
  const addShards = useEconomyStore(state => state.addShards);
  const spendShards = useEconomyStore(state => state.spendShards);
  
  const getCardCount = useInventoryStore(state => state.getCardCount);
  const addCard = useInventoryStore(state => state.addCard);
  const removeCard = useInventoryStore(state => state.removeCard);

  if (!card) return null;

  const count = getCardCount(card.id);
  const rates = getRatesForRarity(card.rarity);

  const [playShatter] = useSound('/sounds/shatter.mp3', { volume: 0.5 });
  const [playCraft] = useSound('/sounds/craft-sparkle.mp3', { volume: 0.5 });

  const handleDismantle = () => {
    if (count > 0) {
      playShatter();
      removeCard(card.id, 1);
      addShards(rates.dismantle);
    }
  };

  const handleCraft = () => {
    if (spendShards(rates.craft)) {
      playCraft();
      addCard(card.id, 1);
    } else {
      alert("Insufficient Holo Shards!");
    }
  };


  // Dynamic Color Tag mapping
  const getColorStyle = (colorName) => {
    switch(colorName.toLowerCase()) {
      case 'red': return { background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5' };
      case 'blue': return { background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#93c5fd' };
      case 'green': return { background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#86efac' };
      case 'yellow': return { background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#fde047' };
      case 'white': return { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #d4d4d8', color: '#ffffff' };
      case 'purple': return { background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#d8b4fe' };
      default: return { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #52525b', color: '#d4d4d8' };
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}
      >
        <motion.div 
          className="modal-content glass-panel"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            background: 'rgba(24, 24, 27, 0.85)', // Sleek dark gray
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Left Pane: Image */}
          <div style={{ flex: '0 0 400px', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
            <img 
              src={card.image_url} 
              alt={card.name} 
              style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
              onError={(e) => { 
                console.warn('Missing image for card ID:', card.id);
                e.target.style.display = 'none'; 
                if (e.target.nextSibling && e.target.nextSibling.classList.contains('fallback-ui')) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div 
              className="fallback-ui" 
              style={{ 
                display: 'none', width: '100%', minHeight: '400px', backgroundColor: '#2a2a35', 
                color: '#a1a1aa', alignItems: 'center', justifyContent: 'center', 
                textAlign: 'center', padding: '16px', boxSizing: 'border-box', 
                flexDirection: 'column', fontSize: '18px', border: '1px solid #444', borderRadius: '12px'
              }}
            >
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</span>
              <span>Image Missing</span>
              <span style={{ fontSize: '14px', marginTop: '8px', color: '#ef4444' }}>{card.id}</span>
            </div>
          </div>

          {/* Right Pane: Details */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', color: '#f4f4f5' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>{card.name}</h2>
                <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '4px' }}>
                  {card.id} • {card.card_type} • {card.rarity}
                </div>
              </div>
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {card.attributes?.hp && (
                <span style={{ padding: '6px 12px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                  HP {card.attributes.hp}
                </span>
              )}
              {card.attributes?.color?.map(c => (
                <span key={c} style={{ padding: '6px 12px', borderRadius: '16px', ...getColorStyle(c) }}>
                  {c}
                </span>
              ))}
              {card.attributes?.tags?.map(t => (
                <span key={t} style={{ padding: '6px 12px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '150px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Card Effect</h3>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {card.attributes?.text || "No effect."}
              </p>
            </div>

            {/* Economy Actions */}
            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Owned: {count}</div>
                <button 
                  onClick={handleDismantle}
                  disabled={count <= 0}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                    background: count > 0 ? 'rgba(220, 38, 38, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: count > 0 ? '#fca5a5' : '#52525b',
                    cursor: count > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold', transition: 'all 0.2s',
                    border: count > 0 ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid transparent'
                  }}
                >
                  Dismantle (+{rates.dismantle} Shards)
                </button>
              </div>

              <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Cost: {rates.craft} Shards</div>
                <button 
                  onClick={handleCraft}
                  disabled={holoShards < rates.craft}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                    background: holoShards >= rates.craft ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: holoShards >= rates.craft ? '#93c5fd' : '#52525b',
                    cursor: holoShards >= rates.craft ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold', transition: 'all 0.2s',
                    border: holoShards >= rates.craft ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent'
                  }}
                >
                  Craft Card
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
