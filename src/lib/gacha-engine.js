import cardsData from '../data/cards.json';

const getCardsByExpansionAndRarity = (pool, rarityList) => {
  return pool.filter(c => rarityList.includes(c.rarity));
};

const pickRandomUnique = (primaryPool, fallbackPool, drawnIds = []) => {
  if (!primaryPool || primaryPool.length === 0) primaryPool = fallbackPool;
  
  let available = primaryPool.filter(c => !drawnIds.includes(c.id));
  
  if (available.length === 0) {
    // Bucket exhausted, fallback to entire expansion pool
    available = fallbackPool.filter(c => !drawnIds.includes(c.id));
  }
  
  if (available.length === 0) {
    // Total expansion exhausted (e.g. promo packs with 1 card), must allow duplicates
    available = fallbackPool;
  }
  
  const selectedCard = available[Math.floor(Math.random() * available.length)];
  return selectedCard ? { ...selectedCard } : null; // Ensure new object reference
};

const pickWithWeights = (options) => {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let roll = Math.random() * totalWeight;
  for (let opt of options) {
    if (roll < opt.weight) return opt.rarityList;
    roll -= opt.weight;
  }
  return options[0].rarityList;
};

// Generates the first 7 slots of a pack (used by both Single and Box generators)
const generateBasePack = (expansionPool, commons, uncommons, cheerCards, drawnIds, forcedCheerCard = null, allowNaturalCheer = true) => {
  const pack = [];
  
  const sCards = getCardsByExpansionAndRarity(expansionPool, ['S']);
  const syCards = getCardsByExpansionAndRarity(expansionPool, ['SY']);
  
  // Slots 1-4: Common (15% chance to be S)
  for (let i = 0; i < 4; i++) {
    const isS = Math.random() < 0.15;
    const pool = isS && sCards.length > 0 ? sCards : commons;
    const c = pickRandomUnique(pool, expansionPool, drawnIds);
    if (c) { pack.push(c); drawnIds.push(c.id); }
  }
  
  // Slots 5-6: 80% Uncommon, 20% Cheer (15% chance to be S or SY respectively)
  let hasCheerInPack = false;
  
  for (let i = 0; i < 2; i++) {
    if (forcedCheerCard && !hasCheerInPack && (i === 1 || Math.random() < 0.5)) {
      pack.push({ ...forcedCheerCard });
      drawnIds.push(forcedCheerCard.id);
      hasCheerInPack = true;
      continue;
    }

    let isCheer = false;
    if (!hasCheerInPack && allowNaturalCheer && !forcedCheerCard) {
      isCheer = Math.random() < 0.20;
    }

    if (isCheer) {
      const isSY = Math.random() < 0.15;
      const pool = isSY && syCards.length > 0 ? syCards : (cheerCards.length > 0 ? cheerCards : uncommons);
      const c = pickRandomUnique(pool, expansionPool, drawnIds);
      if (c) { 
        pack.push(c); 
        drawnIds.push(c.id); 
        hasCheerInPack = true;
      }
    } else {
      const isS = Math.random() < 0.15;
      const pool = isS && sCards.length > 0 ? sCards : uncommons;
      const c = pickRandomUnique(pool, expansionPool, drawnIds);
      if (c) { pack.push(c); drawnIds.push(c.id); }
    }
  }
  
  // Slot 7: Rare (R), Double Rare (RR), or OSR
  const slot7Rarities = pickWithWeights([
    { weight: 70, rarityList: ['R'] },
    { weight: 25, rarityList: ['RR'] },
    { weight: 5, rarityList: ['OSR'] }
  ]);
  let slot7Pool = getCardsByExpansionAndRarity(expansionPool, slot7Rarities);
  if (!slot7Pool.length) slot7Pool = getCardsByExpansionAndRarity(expansionPool, ['R']);
  if (!slot7Pool.length) slot7Pool = commons;
  const c = pickRandomUnique(slot7Pool, expansionPool, drawnIds);
  if (c) { pack.push(c); drawnIds.push(c.id); }
  
  return pack;
};

export const generateSinglePack = (targetExpansionId) => {
  const expansionPool = cardsData.filter(card => card.expansion_id === targetExpansionId);
  if (!expansionPool || expansionPool.length === 0) return [];

  let commons = getCardsByExpansionAndRarity(expansionPool, ['C']);
  if (!commons.length) commons = expansionPool;
  
  let uncommons = getCardsByExpansionAndRarity(expansionPool, ['U']);
  if (!uncommons.length) uncommons = commons;
  
  const cheerCards = expansionPool.filter(c => c.card_type === 'Cheer');

  const drawnIds = [];
  const pack = generateBasePack(expansionPool, commons, uncommons, cheerCards, drawnIds);
  
  // Slot 8: The Pull Slot (Uncollated Pure RNG)
  const slot8Rarities = pickWithWeights([
    { weight: 70, rarityList: ['R'] },
    { weight: 20, rarityList: ['RR'] },
    { weight: 5, rarityList: ['SR'] },
    { weight: 3, rarityList: ['UR', 'OUR', 'HR'] },
    { weight: 2, rarityList: ['SEC'] }
  ]);
  
  let slot8Pool = getCardsByExpansionAndRarity(expansionPool, slot8Rarities);
  
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['SEC']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['UR', 'OUR', 'HR']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['SR']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['OSR']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['RR']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = getCardsByExpansionAndRarity(expansionPool, ['R']);
  if (!slot8Pool || !slot8Pool.length) slot8Pool = commons;

  const slot8Card = pickRandomUnique(slot8Pool, expansionPool, drawnIds);
  if (slot8Card) { 
    drawnIds.push(slot8Card.id);
    const insertIdx = Math.floor(Math.random() * 5) + 3; // Index 3 to 7
    pack.splice(insertIdx, 0, slot8Card);
  }
  
  console.log('Generated Pack:', pack.map(c => c.name));
  return pack;
};

export const generateBox = (targetExpansionId) => {
  const expansionPool = cardsData.filter(card => card.expansion_id === targetExpansionId);
  if (!expansionPool || expansionPool.length === 0) return Array(12).fill([]);

  let commons = getCardsByExpansionAndRarity(expansionPool, ['C']);
  if (!commons.length) commons = expansionPool;
  
  let uncommons = getCardsByExpansionAndRarity(expansionPool, ['U']);
  if (!uncommons.length) uncommons = commons;
  
  const cheerCards = expansionPool.filter(c => c.card_type === 'Cheer');

  // Collation Math
  // Hits Guarantee (SR, OSR, UR, OUR, SEC)
  let numHits = 2;
  const hitRoll = Math.random();
  if (hitRoll > 0.95) numHits = 4;
  else if (hitRoll > 0.80) numHits = 3;
  
  // RR Guarantee (3 to 4)
  const numRRs = Math.random() < 0.5 ? 3 : 4;
  
  // Remaining Slot 8 are standard Rares
  const numRares = 12 - numHits - numRRs;

  const boxSlot8 = [];

  // Pick Hits
  const hitWeightOptions = [
    { weight: 70, rarityList: ['SR'] },
    { weight: 25, rarityList: ['UR', 'OUR', 'HR'] },
    { weight: 5, rarityList: ['SEC'] }
  ];
  
  for (let i = 0; i < numHits; i++) {
    const selectedHitRarity = pickWithWeights(hitWeightOptions);
    let hitPool = getCardsByExpansionAndRarity(expansionPool, selectedHitRarity);
    // Fallbacks
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['SEC']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['UR', 'OUR', 'HR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['SR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['OSR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['RR']);
    if (!hitPool || !hitPool.length) hitPool = commons;
    boxSlot8.push(pickRandomUnique(hitPool, expansionPool, [])); // Pass empty drawnIds for box collation
  }

  // Pick RRs
  for (let i = 0; i < numRRs; i++) {
    let rrPool = getCardsByExpansionAndRarity(expansionPool, ['RR']);
    if (!rrPool || !rrPool.length) rrPool = getCardsByExpansionAndRarity(expansionPool, ['R']);
    if (!rrPool || !rrPool.length) rrPool = commons;
    boxSlot8.push(pickRandomUnique(rrPool, expansionPool, []));
  }

  // Pick Rares
  for (let i = 0; i < numRares; i++) {
    let rPool = getCardsByExpansionAndRarity(expansionPool, ['R']);
    if (!rPool || !rPool.length) rPool = commons;
    boxSlot8.push(pickRandomUnique(rPool, expansionPool, []));
  }
  
  // Shuffle Slot 8 array
  for (let i = boxSlot8.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boxSlot8[i], boxSlot8[j]] = [boxSlot8[j], boxSlot8[i]];
  }

  // --- Distribute 1 of each Cheer card in the box ---
  let boxCheers = [...cheerCards];
  for (let i = boxCheers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boxCheers[i], boxCheers[j]] = [boxCheers[j], boxCheers[i]];
  }
  const assignedCheers = Array(12).fill(null);
  const packIndices = [0,1,2,3,4,5,6,7,8,9,10,11];
  for (let i = packIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [packIndices[i], packIndices[j]] = [packIndices[j], packIndices[i]];
  }
  for (let i = 0; i < Math.min(boxCheers.length, 12); i++) {
    assignedCheers[packIndices[i]] = boxCheers[i];
  }

  // Assemble the 12 packs
  const boxPacks = [];
  for (let i = 0; i < 12; i++) {
    const drawnIds = [];
    const slot8Card = boxSlot8[i];
    if (slot8Card) drawnIds.push(slot8Card.id); // Add slot 8 to drawnIds first
    
    const forcedCheer = assignedCheers[i];
    const pack = generateBasePack(expansionPool, commons, uncommons, cheerCards, drawnIds, forcedCheer, false);
    if (slot8Card) {
      const insertIdx = Math.floor(Math.random() * 5) + 3; // Index 3 to 7
      pack.splice(insertIdx, 0, slot8Card);
    }
    
    boxPacks.push(pack);
  }

  return boxPacks;
};
