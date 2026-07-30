import cardsData from '../data/cards.json';

// Rules based on official Hololive OCG EN
const RESTRICTED_CARDS = {
  'hBP01-030': 1
};

export const validateDeck = (deck) => {
  const errors = [];
  const warnings = [];
  
  // 1. Oshi Validation
  if (!deck.oshi) {
    errors.push("Deck must have exactly 1 Oshi card.");
  }
  
  // 2. Main Deck Validation
  let mainCount = 0;
  const mainCardCounts = {};
  
  for (const [cardId, count] of Object.entries(deck.main || {})) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) continue;
    
    mainCount += count;
    
    // We use the base card number without rarity suffix (e.g., hBP01-001) for the 4-copy limit rule
    // cards.json maps name and id, but number can be extracted from ID by removing the suffix
    const baseNumber = cardId.split('-').slice(0, 2).join('-');
    mainCardCounts[baseNumber] = (mainCardCounts[baseNumber] || 0) + count;
  }
  
  if (mainCount !== 50) {
    errors.push(`Main Deck must contain exactly 50 cards. (Current: ${mainCount})`);
  }
  
  for (const [baseNumber, count] of Object.entries(mainCardCounts)) {
    // Find a representative card for this baseNumber to check attributes
    const sampleCard = cardsData.find(c => c.id.startsWith(baseNumber));
    let hasExtraRule = false;

    if (sampleCard && sampleCard.attributes) {
      const allText = [
        ...(sampleCard.attributes.abilities || []).map(a => a.description),
        ...(sampleCard.attributes.arts || []).map(a => a.description),
        ...(sampleCard.attributes.oshi_skills || []).map(a => a.description),
        sampleCard.attributes.collab_effect,
        sampleCard.attributes.gift_effect,
        sampleCard.attributes.bloom_effect
      ].join(' ').toLowerCase();
      
      if (allText.includes('any number of this holomem')) {
        hasExtraRule = true;
      }
    }

    const limit = RESTRICTED_CARDS[baseNumber] !== undefined ? RESTRICTED_CARDS[baseNumber] : (hasExtraRule ? 50 : 4);
    
    if (count > limit) {
      errors.push(`Cannot have more than ${limit} copies of ${baseNumber}. (Current: ${count})`);
    }
  }
  
  // 3. Cheer Deck Validation
  let cheerCount = 0;
  for (const [cardId, count] of Object.entries(deck.cheer || {})) {
    cheerCount += count;
    // Cheers can have up to 20 copies, so no strict 4-limit check needed.
  }
  
  if (cheerCount !== 20) {
    errors.push(`Cheer Deck must contain exactly 20 cards. (Current: ${cheerCount})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
