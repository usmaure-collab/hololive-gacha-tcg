const fs = require('fs');
const path = require('path');

const RAW_DB_PATH = 'C:/Users/rolan/Documents/Analista de Decks/gacha_test_data.js';
const OUTPUT_PATH = path.join(__dirname, '../src/data/cards.json');

const manualUrlOverrides = {
  'hBP01-014_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-014.png',
  'hBP01-020_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-020.png',
  'hBP01-037_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-037.png',
  'hBP01-043_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-043.png',
  'hBP01-060_UR': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-060.png',
  'hBP01-060_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-060.png',
  'hBP01-067_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-067.png',
  'hBP01-071_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-071.png',
  'hBP01-081_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-081.png',
  'hBP01-087_SEC': 'https://en.hololive-official-cardgame.com/wp-content/images/cardlist/hBP01/EN_hBP01-087.png',
};

try {
  // Load raw data
  const HOCG_DATA = require(RAW_DB_PATH);
  
  const cleanCards = [];

  HOCG_DATA.cards.forEach(card => {
    // 1. Normalize Type
    let cardType = card.type || "";
    if (cardType.toLowerCase().includes("holomem")) {
      cardType = "Member";
    } else if (cardType.toLowerCase().includes("support")) {
      cardType = "Support";
    } else if (cardType === "Oshi" || cardType === "Cheer") {
      cardType = cardType;
    } else {
      cardType = cardType;
    }

    // 2. Map Colors
    let colors = [];
    if (card.color === "青赤") {
      colors = ["Blue", "Red"];
    } else if (card.color && card.color !== "◇") {
      colors = [card.color];
    } else {
      colors = ["Colorless"];
    }

    // 3. Generate Official English Image URL
    let num = String(card.number || "").trim();
    if (num === "hBP01-127") num = "hY01-001";
    if (num === "hBP01-128") num = "hY02-001";
    if (num === "hBP01-129") num = "hY03-001";
    if (num === "hBP01-130") num = "hY04-001";
    if (num === "hBP01-131") num = "hY05-001";
    if (num === "hBP01-132") num = "hY06-001";
    if (num === "hBP01-133") num = "hY01-001";
    
    let folder = num.split("-")[0];
    let declaredRarity = String(card.rarity || "C").split("/")[0].trim();
    
    const urls = [];
    const suffixes = [declaredRarity, "C", "U", "R", "RR", "SR", "OSR", "OUR", "SEC", "UR", "P", ""];
    const uniqueSuffixes = [...new Set(suffixes)];
    
    uniqueSuffixes.forEach(s => {
      let suf = s ? `_${s}` : "";
      if (folder.startsWith('hY') || folder.startsWith('hSD')) suf = ""; // Cheers and SDs don't use rarity suffixes usually
      
      // English site
      urls.push(`https://en.hololive-official-cardgame.com/wp-content/images/cardlist/${folder}/EN_${num}${suf}.png`);
      // Japanese site
      urls.push(`https://hololive-official-cardgame.com/wp-content/images/cardlist/${folder}/${num}${suf}.png`);
      // English COMMON folder
      urls.push(`https://en.hololive-official-cardgame.com/wp-content/images/cardlist/COMMON/EN_${num}${suf}.png`);
      // Japanese COMMON folder
      urls.push(`https://hololive-official-cardgame.com/wp-content/images/cardlist/COMMON/${num}${suf}.png`);
    });

    // Deduplicate the generated URLs since Cheer/SD stripping creates duplicates
    const uniqueUrls = [...new Set(urls)];
    
    let imageUrl = uniqueUrls[0];
    const baseKey = `${num}_${declaredRarity}`;
    if (manualUrlOverrides[baseKey]) {
      uniqueUrls.unshift(manualUrlOverrides[baseKey]);
      imageUrl = manualUrlOverrides[baseKey];
    }

    // 4. Translate text (Search Optimization)
    let translatedText = card.text || "";
    translatedText = translatedText.replace(/Produce 1 Cheer blanco/gi, "Produces 1 White Cheer");
    translatedText = translatedText.replace(/Produce 1 Cheer rojo/gi, "Produces 1 Red Cheer");
    translatedText = translatedText.replace(/Produce 1 Cheer verde/gi, "Produces 1 Green Cheer");
    translatedText = translatedText.replace(/Produce 1 Cheer azul/gi, "Produces 1 Blue Cheer");
    translatedText = translatedText.replace(/Produce 1 Cheer amarillo/gi, "Produces 1 Yellow Cheer");
    translatedText = translatedText.replace(/Produce 1 Cheer morado/gi, "Produces 1 Purple Cheer");
    translatedText = translatedText.replace(/Event LIMITED\. Busca en tu deck cualquier carta\./gi, "LIMITED Event. Search your deck for any card.");

    let hpValue = null;
    if (card.hp) {
       const parsed = parseInt(card.hp, 10);
       if (!isNaN(parsed)) hpValue = parsed;
    }
    
    let expansionId = "Unknown";
    let rawSet = card.set || "";
    if (rawSet.includes("Booster Pack 1")) expansionId = "hBP01";
    else if (rawSet.includes("Booster Pack 2")) expansionId = "hBP02";
    else if (rawSet.includes("Booster Pack 3")) expansionId = "hBP03";
    else if (rawSet.includes("Booster Pack 4")) expansionId = "hBP04";
    else if (rawSet.includes("Booster Pack 5")) expansionId = "hBP05";
    else if (rawSet.includes("Booster Pack 6")) expansionId = "hBP06";
    else if (rawSet.includes("Start Deck")) expansionId = "hSD";
    else if (rawSet.includes("Cheer")) expansionId = "hY";

    // Detect and filter Ghost Cards (Legacy Variant Copies)
    // The legacy database migrated variants as completely separate objects with IDs like hY01-001-C.
    // For Cheers (hY) and Starter Decks (hSD), these are structurally identical and break image URLs.
    if ((expansionId === "hY" || expansionId === "hSD") && card.id !== card.number) {
      return; // Skip this ghost card entirely
    }

    // Construct strict schema
    const newCard = {
      id: card.id,
      name: card.name,
      card_type: cardType,
      rarity: declaredRarity,
      expansion_id: expansionId,
      image_url: imageUrl,
      image_urls: uniqueUrls,
      attributes: {
        hp: hpValue,
        color: colors,
        tags: Array.isArray(card.tags) ? card.tags : [],
        text: translatedText
      }
    };
    
    cleanCards.push(newCard);
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanCards, null, 2), 'utf8');
  console.log(`Successfully mapped ${cleanCards.length} cards to strict schema at ${OUTPUT_PATH}`);

} catch (e) {
  console.error("Failed to clean database:", e);
  process.exit(1);
}
