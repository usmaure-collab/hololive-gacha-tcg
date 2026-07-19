export const getCardBack = (card) => {
  if (!card) return '/cards/back-standard.png';

  const type = (card.card_type || '').toLowerCase();
  const rarity = (card.rarity || '').toUpperCase();

  // Rule A (Oshi Cards)
  if (type === 'oshi' || ['OSR', 'OUR', 'HR'].includes(rarity)) {
    return '/cards/back-oshi.jpg';
  }

  // Rule B (Cheer Cards)
  if (type === 'cheer' || rarity === 'SY') {
    return '/cards/back-cheer.jpg';
  }

  // Rule C (Standard Cards - Holomems, Supports, Events, etc.)
  return '/cards/back-standard.webp';
};

export const getCardBorderColor = (card) => {
  if (!card) return '#d4af37'; // Default gold

  const type = (card.card_type || '').toLowerCase();
  const rarity = (card.rarity || '').toUpperCase();

  // Oshi or Cheer cards -> White
  if (type === 'oshi' || type === 'cheer' || ['OSR', 'OUR', 'HR', 'SY'].includes(rarity)) {
    return '#f8fafc'; // White
  }

  // Standard -> Gold
  return '#d4af37'; // Gold
};

export const getCardFrontBorderColor = (card) => {
  if (!card) return 'transparent';

  const rarity = (card.rarity || '').toUpperCase();
  
  if (rarity === 'C') return '#b87333'; // Copper
  if (rarity === 'U') return '#c0c0c0'; // Silver
  if (rarity === 'R') return '#ffd700'; // Gold
  if (['RR', 'SR'].includes(rarity)) return '#e5e4e2'; // Platinum
  
  // For higher rarities or unknown, no border
  return 'transparent'; 
};
