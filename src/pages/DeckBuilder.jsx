import { useState, useMemo, useEffect } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { useDeckStore } from '../store/useDeckStore';
import cardsData from '../data/cards.json';
import { validateDeck } from '../lib/deck-rules';
import '../features/deck-builder/deck.css';

export default function DeckBuilder() {
  const collection = useInventoryStore(state => state.collection);
  const { decks, activeDeckId, createDeck, setActiveDeck, updateDeck } = useDeckStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // If no deck exists, show create prompt
  if (decks.length === 0) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>No Decks Found</h2>
          <button 
            className="btn-primary" 
            onClick={() => createDeck("My First Deck")}
            style={{ width: 'auto', padding: '12px 32px' }}
          >
            Create New Deck
          </button>
        </div>
      </div>
    );
  }
  
  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];
  
  useEffect(() => {
    if (!activeDeckId && decks.length > 0) {
      setActiveDeck(decks[0].id);
    }
  }, [decks, activeDeckId, setActiveDeck]);

  const ownedCards = useMemo(() => {
    const merged = Object.entries(collection).map(([id, data]) => {
      const cardInfo = cardsData.find(c => c.id === id);
      return { ...cardInfo, maxCount: data.count };
    }).filter(c => c.id !== undefined);

    // Inject infinite basic cheers
    const basicCheers = cardsData.filter(c => c.expansion_id === 'hY');
    basicCheers.forEach(cheer => {
      const existing = merged.find(c => c.id === cheer.id);
      if (existing) {
        existing.maxCount = Infinity;
      } else {
        merged.push({ ...cheer, maxCount: Infinity });
      }
    });
    return merged;
  }, [collection]);

  const filteredCollection = useMemo(() => {
    return ownedCards.filter(card => {
      if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.id.localeCompare(b.id));
  }, [ownedCards, searchTerm]);

  const addCardToDeck = (card) => {
    if (!activeDeck) return;
    
    // Check if max copies reached in deck vs collection
    const currentMain = activeDeck.main[card.id] || 0;
    const currentCheer = activeDeck.cheer[card.id] || 0;
    const totalInDeck = (card.id === activeDeck.oshi ? 1 : 0) + currentMain + currentCheer;
    
    if (totalInDeck >= card.maxCount) return; // Can't add more than owned

    const newDeckData = { ...activeDeck };
    
    if (card.card_type === 'Oshi') {
      newDeckData.oshi = card.id;
    } else if (card.card_type === 'Cheer') {
      newDeckData.cheer = { ...newDeckData.cheer, [card.id]: currentCheer + 1 };
    } else {
      newDeckData.main = { ...newDeckData.main, [card.id]: currentMain + 1 };
    }
    
    updateDeck(activeDeck.id, newDeckData);
  };

  const removeCardFromDeck = (cardId, type) => {
    if (!activeDeck) return;
    const newDeckData = { ...activeDeck };
    
    if (type === 'oshi') {
      newDeckData.oshi = null;
    } else if (type === 'cheer') {
      const current = newDeckData.cheer[cardId];
      if (current > 1) newDeckData.cheer = { ...newDeckData.cheer, [cardId]: current - 1 };
      else {
        const { [cardId]: _, ...rest } = newDeckData.cheer;
        newDeckData.cheer = rest;
      }
    } else {
      const current = newDeckData.main[cardId];
      if (current > 1) newDeckData.main = { ...newDeckData.main, [cardId]: current - 1 };
      else {
        const { [cardId]: _, ...rest } = newDeckData.main;
        newDeckData.main = rest;
      }
    }
    updateDeck(activeDeck.id, newDeckData);
  };

  const validation = activeDeck ? validateDeck(activeDeck) : { isValid: true, errors: [] };

  const renderDeckCard = (cardId, type, count) => {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) return null;
    return (
      <div key={cardId} className="mini-card" onClick={() => removeCardFromDeck(cardId, type)}>
        <img 
          src={card.image_url} 
          alt={card.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} 
          onError={(e) => { 
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
        <div 
          className="fallback-ui" 
          style={{ 
            display: 'none', width: '100%', height: '100%', backgroundColor: '#2a2a35', 
            color: '#a1a1aa', alignItems: 'center', justifyContent: 'center', 
            textAlign: 'center', boxSizing: 'border-box', 
            flexDirection: 'column', fontSize: '10px', border: '1px solid #444', borderRadius: '6px'
          }}
        >
          <span style={{ color: '#ef4444' }}>{card.id}</span>
        </div>
        {card.rarity && card.rarity !== 'Unknown' && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '9px',
            fontWeight: 'bold',
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            {card.rarity}
          </div>
        )}
        {count > 1 && (
          <div style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
            {count}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Deck Builder</h1>
        <select 
          value={activeDeckId || ''} 
          onChange={e => setActiveDeck(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '8px', background: '#18181b', color: 'white', border: '1px solid #3f3f46' }}
        >
          {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="split-layout">
        {/* Collection Pane */}
        <div className="glass-panel collection-pane">
          <div className="pane-header">
            Collection
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #3f3f46', background: '#09090b', color: 'white', fontSize: '14px' }}
            />
          </div>
          <div className="pane-content" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
            {filteredCollection.map(card => (
              <div key={card.id} className="mini-card" onClick={() => addCardToDeck(card)}>
                <img 
                  src={card.image_url} 
                  alt={card.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} 
                  loading="lazy" 
                  onError={(e) => { 
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
                <div 
                  className="fallback-ui" 
                  style={{ 
                    display: 'none', width: '100%', height: '100%', backgroundColor: '#2a2a35', 
                    color: '#a1a1aa', alignItems: 'center', justifyContent: 'center', 
                    textAlign: 'center', boxSizing: 'border-box', 
                    flexDirection: 'column', fontSize: '10px', border: '1px solid #444', borderRadius: '6px'
                  }}
                >
                  <span style={{ color: '#ef4444' }}>{card.id}</span>
                </div>
                {card.rarity && card.rarity !== 'Unknown' && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    border: '1px solid rgba(255,255,255,0.2)',
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}>
                    {card.rarity}
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
                  {card.maxCount === Infinity ? '∞' : card.maxCount}
                </div>
              </div>
            ))}
            {filteredCollection.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', width: '100%', color: '#a1a1aa' }}>
                No cards match your search.
              </div>
            )}
          </div>
        </div>

        {/* Deck Pane */}
        <div className="glass-panel deck-pane">
          <div className="pane-header">
            {activeDeck?.name}
            {validation.isValid ? (
              <span style={{ color: '#4ade80', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ Valid</span>
            ) : (
              <span style={{ color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>! {validation.errors.length} Errors</span>
            )}
          </div>
          <div className="pane-content">
            {!validation.isValid && (
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <ul style={{ color: '#fca5a5', fontSize: '14px', margin: 0, paddingLeft: '16px' }}>
                  {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <div className="deck-section-title">Oshi</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {activeDeck?.oshi ? renderDeckCard(activeDeck.oshi, 'oshi', 1) : (
                <div className="mini-card" style={{ border: '2px dashed #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>No Oshi</div>
              )}
            </div>

            <div className="deck-section-title">
              Main Deck ({Object.values(activeDeck?.main || {}).reduce((a,b)=>a+b,0)}/50)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(activeDeck?.main || {}).map(([id, count]) => renderDeckCard(id, 'main', count))}
            </div>

            <div className="deck-section-title">
              Cheer Deck ({Object.values(activeDeck?.cheer || {}).reduce((a,b)=>a+b,0)}/20)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(activeDeck?.cheer || {}).map(([id, count]) => renderDeckCard(id, 'cheer', count))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
