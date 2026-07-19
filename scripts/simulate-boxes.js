import fs from 'fs';

// Quick simulation avoiding ES module config issues, using the compiled logic
// Since gacha-engine is an ES module but we don't have package.json type:module setup easily for scripts,
// I'll just write an inline simulator using the same logic.

const cardsData = JSON.parse(fs.readFileSync('./src/data/cards.json'));

const getCardsByExpansionAndRarity = (pool, rarityList) => {
  return pool.filter(c => rarityList.includes(c.rarity));
};

const pickRandomUnique = (primaryPool, fallbackPool, drawnIds = []) => {
  if (!primaryPool || primaryPool.length === 0) primaryPool = fallbackPool;
  let available = primaryPool.filter(c => !drawnIds.includes(c.id));
  if (available.length === 0) available = fallbackPool.filter(c => !drawnIds.includes(c.id));
  if (available.length === 0) available = fallbackPool;
  const selectedCard = available[Math.floor(Math.random() * available.length)];
  return selectedCard ? { ...selectedCard } : null;
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

const generateBasePack = (expansionPool, commons, uncommons, cheerCards, drawnIds) => {
  const pack = [];
  const sCards = getCardsByExpansionAndRarity(expansionPool, ['S']);
  const syCards = getCardsByExpansionAndRarity(expansionPool, ['SY']);
  
  for (let i = 0; i < 4; i++) {
    const isS = Math.random() < 0.15;
    const pool = isS && sCards.length > 0 ? sCards : commons;
    const c = pickRandomUnique(pool, expansionPool, drawnIds);
    if (c) { pack.push(c); drawnIds.push(c.id); }
  }
  
  for (let i = 0; i < 2; i++) {
    const isCheer = Math.random() < 0.20;
    if (isCheer) {
      const isSY = Math.random() < 0.15;
      const pool = isSY && syCards.length > 0 ? syCards : (cheerCards.length > 0 ? cheerCards : uncommons);
      const c = pickRandomUnique(pool, expansionPool, drawnIds);
      if (c) { pack.push(c); drawnIds.push(c.id); }
    } else {
      const isS = Math.random() < 0.15;
      const pool = isS && sCards.length > 0 ? sCards : uncommons;
      const c = pickRandomUnique(pool, expansionPool, drawnIds);
      if (c) { pack.push(c); drawnIds.push(c.id); }
    }
  }
  
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

const generateBox = (targetExpansionId) => {
  const expansionPool = cardsData.filter(card => card.expansion_id === targetExpansionId);
  if (!expansionPool || expansionPool.length === 0) return Array(12).fill([]);

  let commons = getCardsByExpansionAndRarity(expansionPool, ['C']);
  if (!commons.length) commons = expansionPool;
  
  let uncommons = getCardsByExpansionAndRarity(expansionPool, ['U']);
  if (!uncommons.length) uncommons = commons;
  
  const cheerCards = expansionPool.filter(c => c.card_type === 'Cheer');

  let numHits = 2;
  const hitRoll = Math.random();
  if (hitRoll > 0.95) numHits = 4;
  else if (hitRoll > 0.80) numHits = 3;
  
  const numRRs = Math.random() < 0.5 ? 3 : 4;
  const numRares = 12 - numHits - numRRs;

  const boxSlot8 = [];

  const hitWeightOptions = [
    { weight: 70, rarityList: ['SR'] },
    { weight: 25, rarityList: ['UR', 'OUR', 'HR'] },
    { weight: 5, rarityList: ['SEC'] }
  ];
  
  for (let i = 0; i < numHits; i++) {
    const selectedHitRarity = pickWithWeights(hitWeightOptions);
    let hitPool = getCardsByExpansionAndRarity(expansionPool, selectedHitRarity);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['SEC']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['UR', 'OUR', 'HR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['SR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['OSR']);
    if (!hitPool || !hitPool.length) hitPool = getCardsByExpansionAndRarity(expansionPool, ['RR']);
    if (!hitPool || !hitPool.length) hitPool = commons;
    boxSlot8.push(pickRandomUnique(hitPool, expansionPool, []));
  }

  for (let i = 0; i < numRRs; i++) {
    let rrPool = getCardsByExpansionAndRarity(expansionPool, ['RR']);
    if (!rrPool || !rrPool.length) rrPool = getCardsByExpansionAndRarity(expansionPool, ['R']);
    if (!rrPool || !rrPool.length) rrPool = commons;
    boxSlot8.push(pickRandomUnique(rrPool, expansionPool, []));
  }

  for (let i = 0; i < numRares; i++) {
    let rPool = getCardsByExpansionAndRarity(expansionPool, ['R']);
    if (!rPool || !rPool.length) rPool = commons;
    boxSlot8.push(pickRandomUnique(rPool, expansionPool, []));
  }
  
  for (let i = boxSlot8.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boxSlot8[i], boxSlot8[j]] = [boxSlot8[j], boxSlot8[i]];
  }

  const boxPacks = [];
  for (let i = 0; i < 12; i++) {
    const drawnIds = [];
    const slot8Card = boxSlot8[i];
    if (slot8Card) drawnIds.push(slot8Card.id);
    
    const pack = generateBasePack(expansionPool, commons, uncommons, cheerCards, drawnIds);
    if (slot8Card) pack.push(slot8Card);
    
    boxPacks.push(pack);
  }

  return boxPacks;
};

const numBoxes = 1000;
const counts = {
  RR: 0,
  OSR: 0,
  S: 0,
  SY: 0,
  SR: 0,
  UR: 0,
  OUR: 0,
  HR: 0,
  SEC: 0,
};

for (let i = 0; i < numBoxes; i++) {
  const boxPacks = generateBox('hBP06');
  for (const pack of boxPacks) {
    for (const card of pack) {
      if (counts[card.rarity] !== undefined) {
        counts[card.rarity]++;
      }
    }
  }
}

console.log('--- AVERAGE PULLS PER BOOSTER BOX ---');
for (const [rarity, total] of Object.entries(counts)) {
  console.log(`${rarity}: ${(total / numBoxes).toFixed(2)}`);
}
