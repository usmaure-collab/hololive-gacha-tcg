const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '../src/data/cards.json');
const OUTPUT_PATH = path.join(__dirname, 'verified-cards.json');

// We use images.weserv.nl as a proxy because the official Hololive image server 
// aggressively blocks Node.js (returns 403 Forbidden on automated HEAD/GET requests).
const PROXY_BASE = 'https://images.weserv.nl/?url=';

const SUFFIXES = ['', '_C', '_U', '_R', '_RR', '_SR', '_UR', '_SEC', '_OSR', '_OUR', '_SY', '_P'];

// Helper for delay
const delay = ms => new Promise(res => setTimeout(res, ms));

async function checkUrl(url) {
  try {
    const proxyUrl = `${PROXY_BASE}${encodeURIComponent(url)}`;
    // We can use HEAD on the proxy, Weserv supports it and returns 200 if the underlying image exists
    const response = await fetch(proxyUrl, { method: 'HEAD' });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function run() {
  console.log('Starting Brute Force URL Mapper...');
  const cards = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  const verifiedCards = [];
  
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    console.log(`[${i + 1}/${cards.length}] Verifying: ${card.id} - ${card.name}`);

    // If it's a Cheer or SD, they usually don't have suffixes.
    const folder = card.id.split('-')[0];
    
    // We will build an array of URLs to test in order of likelihood
    const urlsToTest = [];
    
    // 1. Try the exact image_url it already has
    if (card.image_url) urlsToTest.push(card.image_url);

    // 2. Generate all permutations
    const num = card.id; // e.g. hBP01-001
    
    for (const suf of SUFFIXES) {
      // English site
      urlsToTest.push(`https://en.hololive-official-cardgame.com/wp-content/images/cardlist/${folder}/EN_${num}${suf}.png`);
      // Japanese site
      urlsToTest.push(`https://hololive-official-cardgame.com/wp-content/images/cardlist/${folder}/${num}${suf}.png`);
      // English COMMON
      urlsToTest.push(`https://en.hololive-official-cardgame.com/wp-content/images/cardlist/COMMON/EN_${num}${suf}.png`);
      // Japanese COMMON
      urlsToTest.push(`https://hololive-official-cardgame.com/wp-content/images/cardlist/COMMON/${num}${suf}.png`);
      // Also check the Expansion folder (e.g. hBP02) for promos or variants (like SY Cheer cards)
      if (card.expansion_id) {
        urlsToTest.push(`https://en.hololive-official-cardgame.com/wp-content/images/cardlist/${card.expansion_id}/EN_${num}${suf}.png`);
        urlsToTest.push(`https://hololive-official-cardgame.com/wp-content/images/cardlist/${card.expansion_id}/${num}${suf}.png`);
      }
    }

    // Deduplicate array
    const uniqueUrls = [...new Set(urlsToTest)];
    let foundWorkingUrl = null;

    for (const testUrl of uniqueUrls) {
      const exists = await checkUrl(testUrl);
      if (exists) {
        foundWorkingUrl = testUrl;
        break; 
      }
      // Rate limit to prevent getting blocked by proxy or origin
      await delay(100); 
    }

    if (foundWorkingUrl) {
      console.log(`  -> SUCCESS: ${foundWorkingUrl}`);
      card.image_url = foundWorkingUrl;
      // Remove the fallback array if it exists to keep frontend "dumb"
      delete card.image_urls; 
      verifiedCards.push(card);
      successCount++;
    } else {
      console.log(`  -> FAILED: Could not find ANY valid image for ${card.id}`);
      failCount++;
      // Still push it so we don't lose the card data, but it will be broken
      delete card.image_urls;
      verifiedCards.push(card);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(verifiedCards, null, 2), 'utf8');
  console.log('--- BRUTE FORCE COMPLETE ---');
  console.log(`Successfully mapped: ${successCount}`);
  console.log(`Failed to map: ${failCount}`);
  console.log(`Saved to: ${OUTPUT_PATH}`);
}

run();
