import { useState, useMemo } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import cardsData from '../data/cards.json';
import Card3D from '../components/cards/Card3D';
import { EXPANSIONS, getExpansionName } from '../utils/expansions';

export default function Collection() {
  const collection = useInventoryStore(state => state.collection);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("All");
  const [expansionFilter, setExpansionFilter] = useState("All");

  const ownedCards = useMemo(() => {
    return Object.entries(collection).map(([id, data]) => {
      const cardInfo = cardsData.find(c => c.id === id);
      return { ...cardInfo, count: data.count };
    }).filter(c => c.id !== undefined); // filter out if not found in db
  }, [collection]);

  const filteredCards = useMemo(() => {
    return ownedCards.filter(card => {
      if (rarityFilter !== "All" && card.rarity !== rarityFilter) return false;
      if (expansionFilter !== "All" && card.expansion_id !== expansionFilter) return false;
      if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID naturally
  }, [ownedCards, searchTerm, rarityFilter, expansionFilter]);

  const rarities = ["All", ...new Set(ownedCards.map(c => c.rarity))].filter(Boolean);
  const expansions = ["All", ...new Set(ownedCards.map(c => c.expansion_id))].filter(Boolean);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Collection</h1>
        <div style={{ fontSize: '16px', color: '#a1a1aa' }}>
          {filteredCards.length} Cards Found
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search by name..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', background: '#18181b', color: 'white' }}
        />
        <select 
          value={rarityFilter}
          onChange={e => setRarityFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', background: '#18181b', color: 'white', minWidth: '150px' }}
        >
          {rarities.map(r => <option key={r} value={r}>{r === 'All' ? 'All Rarities' : r}</option>)}
        </select>
        <select 
          value={expansionFilter}
          onChange={e => setExpansionFilter(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', background: '#18181b', color: 'white', minWidth: '200px' }}
        >
          {expansions.map(e => <option key={e} value={e}>{e === 'All' ? 'All Expansions' : getExpansionName(e)}</option>)}
        </select>
      </div>

      {filteredCards.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center' }}>
          {filteredCards.map(card => (
            <Card3D key={card.id} card={card} count={card.count} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', color: '#a1a1aa' }}>
          No cards found matching your criteria.
        </div>
      )}
    </div>
  );
}
