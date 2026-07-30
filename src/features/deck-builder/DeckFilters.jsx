import React from 'react';

// The energies based on the Hololive official game
const ENERGIES = [
  { name: 'White', color: '#f8fafc', shadow: 'rgba(255,255,255,0.8)' },
  { name: 'Green', color: '#4ade80', shadow: 'rgba(74,222,128,0.8)' },
  { name: 'Red', color: '#f87171', shadow: 'rgba(248,113,113,0.8)' },
  { name: 'Blue', color: '#60a5fa', shadow: 'rgba(96,165,250,0.8)' },
  { name: 'Purple', color: '#c084fc', shadow: 'rgba(192,132,252,0.8)' },
  { name: 'Yellow', color: '#facc15', shadow: 'rgba(250,204,21,0.8)' },
  { name: 'Neutral', color: '#94a3b8', shadow: 'rgba(148,163,184,0.8)' }
];

export default function DeckFilters({
  searchTerm,
  setSearchTerm,
  selectedColors,
  setSelectedColors,
  selectedExpansion,
  setSelectedExpansion,
  selectedRarity,
  setSelectedRarity,
  expansions,
  rarities
}) {
  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter(c => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      background: 'rgba(24, 24, 27, 0.4)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #3f3f46',
      marginBottom: '16px',
      borderRadius: '8px'
    }}>
      {/* Top Row: Search and Colors */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search cards..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '8px', 
            border: '1px solid #3f3f46', 
            background: 'rgba(9, 9, 11, 0.7)', 
            color: 'white', 
            fontSize: '14px',
            minWidth: '200px'
          }}
        />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Energy</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {ENERGIES.map(energy => {
              const isActive = selectedColors.includes(energy.name);
              return (
                <button
                  key={energy.name}
                  onClick={() => toggleColor(energy.name)}
                  title={energy.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: energy.color,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isActive ? 1 : 0.2,
                    filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)',
                    boxShadow: isActive ? `0 0 12px ${energy.shadow}` : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Dropdowns */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Expansion</span>
          <select
            value={selectedExpansion}
            onChange={e => setSelectedExpansion(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(9, 9, 11, 0.7)',
              color: 'white',
              border: '1px solid #3f3f46',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Expansions</option>
            {expansions.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#a1a1aa', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Rarity</span>
          <select
            value={selectedRarity}
            onChange={e => setSelectedRarity(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(9, 9, 11, 0.7)',
              color: 'white',
              border: '1px solid #3f3f46',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="All">All Rarities</option>
            {rarities.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
