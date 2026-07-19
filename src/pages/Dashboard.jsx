import { usePlayerStore } from '../store/usePlayerStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useDeckStore } from '../store/useDeckStore';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const credits = usePlayerStore(state => state.credits);
  const stats = usePlayerStore(state => state.stats);
  const collection = useInventoryStore(state => state.collection);
  const decks = useDeckStore(state => state.decks);
  
  const uniqueCardsCount = Object.keys(collection).length;
  const totalCardsCount = Object.values(collection).reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Total Credits</h3>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#fbbf24' }}>{credits.toLocaleString()}</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Collection Progress</h3>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#38bdf8' }}>{uniqueCardsCount} <span style={{ fontSize: '18px', color: '#a1a1aa', fontWeight: 'normal' }}>Unique Cards</span></div>
          <div style={{ fontSize: '14px', color: '#a1a1aa', marginTop: '8px' }}>Total Owned: {totalCardsCount}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Decks Created</h3>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#a78bfa' }}>{decks.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: '#a1a1aa', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px' }}>Packs Opened</h3>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#4ade80' }}>{stats.packsOpened}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Ready to pull?</h2>
          <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Head over to the Booster Shop to spend your credits and expand your Hololive OCG collection!</p>
          <Link to="/shop" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-block', marginTop: 'auto' }}>Go to Shop</Link>
        </div>
        
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Build your dream deck</h2>
          <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Use your collected cards to build and validate standard decks to test out your strategies.</p>
          <Link to="/deck-builder" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-block', marginTop: 'auto', backgroundColor: '#3b82f6' }}>Go to Deck Builder</Link>
        </div>
      </div>
    </div>
  );
}
