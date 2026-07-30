import React, { useMemo, useState } from 'react';
import useSound from 'use-sound';
import { useEconomyStore, getRatesForRarity } from '../store/useEconomyStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { calculateExcess } from '../lib/excess-logic';
import cardsData from '../data/cards.json';
import ShardBurst from '../components/ui/ShardBurst';

export default function ScrapShop() {
  const holoShards = useEconomyStore(state => state.holoShards);
  const addShards = useEconomyStore(state => state.addShards);
  
  const collection = useInventoryStore(state => state.collection);
  const removeCard = useInventoryStore(state => state.removeCard);

  const [dismantling, setDismantling] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const [playShatter] = useSound('/sounds/shatter.mp3', { volume: 0.5 });

  const excessInfo = useMemo(() => {
    let totalCardsToDismantle = 0;
    let totalShardsToGain = 0;
    const cardsToDismantle = [];

    Object.entries(collection).forEach(([id, data]) => {
      const cardInfo = cardsData.find(c => c.id === id);
      if (!cardInfo) return;

      const excess = calculateExcess(cardInfo, data.count);
      if (excess > 0) {
        const rates = getRatesForRarity(cardInfo.rarity);
        totalCardsToDismantle += excess;
        totalShardsToGain += (excess * rates.dismantle);
        cardsToDismantle.push({ id: cardInfo.id, amount: excess });
      }
    });

    return { totalCardsToDismantle, totalShardsToGain, cardsToDismantle };
  }, [collection]);

  const handleDismantleAll = () => {
    if (excessInfo.totalCardsToDismantle === 0) return;
    
    const confirm = window.confirm(
      `You will dismantle ${excessInfo.totalCardsToDismantle} excess cards in exchange for ${excessInfo.totalShardsToGain} Holo Shards.\n\nProceed?`
    );

    if (confirm) {
      playShatter(); // Play sound effect immediately upon user interaction
      setDismantling(true);
      setShowBurst(true); // Trigger the visual burst
      
      setTimeout(() => {
        // Execute batch removal
        excessInfo.cardsToDismantle.forEach(({ id, amount }) => {
          removeCard(id, amount);
        });
        
        // Add funds
        addShards(excessInfo.totalShardsToGain);
        
        setDismantling(false);
        // We do not set showBurst(false) here, it cleans itself up, but we could if we wanted.
        alert(`Successfully dismantled ${excessInfo.totalCardsToDismantle} cards and gained ${excessInfo.totalShardsToGain} Holo Shards!`);
      }, 500); // 500ms delay to let the explosion play out
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Header & Balance */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 8px 0', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Holo Laboratory
        </h1>
        <p style={{ color: '#a1a1aa', fontSize: '18px', margin: 0 }}>Dismantle excess cards and craft new ones.</p>
        
        <div style={{ 
          marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '12px', 
          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '16px 32px', borderRadius: '32px', boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
        }}>
          <span style={{ fontSize: '24px' }}>💎</span>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#bfdbfe' }}>
            {holoShards.toLocaleString()}
          </span>
          <span style={{ fontSize: '14px', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>Holo Shards</span>
        </div>
      </div>

      {/* Global Dismantle Action */}
      <div className="glass-panel" style={{ 
        maxWidth: '600px', width: '100%', padding: '40px', 
        background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(147, 197, 253, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#f8fafc' }}>Batch Dismantle</h2>
        <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
          Automatically detect and dismantle all cards in your collection that exceed the official playable limits (Oshi &gt; 1, Cheer &gt; 20, Standard &gt; 4).
        </p>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '24px', borderRadius: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Excess Cards</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f8fafc' }}>{excessInfo.totalCardsToDismantle}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Potential Gain</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#93c5fd' }}>+{excessInfo.totalShardsToGain}</div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {showBurst && <ShardBurst onComplete={() => setShowBurst(false)} />}
          <button 
            onClick={handleDismantleAll}
            disabled={excessInfo.totalCardsToDismantle === 0 || dismantling}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              background: excessInfo.totalCardsToDismantle > 0 ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : 'rgba(255,255,255,0.05)',
              color: excessInfo.totalCardsToDismantle > 0 ? 'white' : '#475569',
              cursor: excessInfo.totalCardsToDismantle > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: excessInfo.totalCardsToDismantle > 0 ? '0 10px 25px rgba(59, 130, 246, 0.4)' : 'none',
              opacity: dismantling ? 0.7 : 1
            }}
          >
            {dismantling ? 'Processing...' : 'Dismantle All Excess'}
          </button>
        </div>
      </div>

    </div>
  );
}
