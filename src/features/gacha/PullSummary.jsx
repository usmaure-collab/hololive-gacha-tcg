import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CardDetailModal from '../../components/cards/CardDetailModal';
import Card3D from '../../components/cards/Card3D';

export default function PullSummary({ cards, onClose }) {
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <motion.div 
      className="pull-summary page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', overflow: 'hidden', paddingTop: '0px', position: 'relative' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '4px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Pack Summary</h2>
      <p style={{ color: '#a1a1aa', marginBottom: '2vh', fontSize: '16px' }}>Click any card to view details</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2vh 3vw', justifyContent: 'center', alignItems: 'center', transform: 'scale(0.95)' }}>
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            onClick={() => setSelectedCard(card)}
            style={{ cursor: 'pointer' }}
          >
            <Card3D card={card} count={1} />
          </motion.div>
        ))}
      </div>

      <motion.button 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 1 }}
        onClick={onClose}
        style={{ 
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          padding: '12px 32px',
          borderRadius: '24px',
          background: 'rgba(59, 130, 246, 0.2)', // Blue tint glass
          border: '1px solid rgba(59, 130, 246, 0.5)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          zIndex: 100,
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.4)'}
        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
      >
        Collect Cards ✨
      </motion.button>

      {selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </motion.div>
  );
}
