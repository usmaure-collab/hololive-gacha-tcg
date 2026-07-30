const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio'); 

const CARDS_FILE_PATH = path.join(__dirname, '../src/data/cards.json');

// Heavy delay to prevent IP bans from the official server
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function enrichCards() {
  console.log('---------------------------------------------------');
  console.log('🚀 Initiating Phase 7.3: Puppeteer Data Extraction 🚀');
  console.log('---------------------------------------------------\n');

  let cardsData;
  try {
    cardsData = JSON.parse(fs.readFileSync(CARDS_FILE_PATH, 'utf-8'));
    console.log(`Loaded ${cardsData.length} cards. Starting headless browser...\n`);
  } catch (err) {
    console.error('Fatal Error: Could not read cards.json', err.message);
    process.exit(1);
  }

  let updatedCount = 0;
  let failedCount = 0;

  // 1. Launch Puppeteer in headless mode
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const page = await browser.newPage();
  
  // Optimize by blocking images, CSS, and fonts (we only care about the DOM text)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];
    const url = `https://en.hololive-official-cardgame.com/cardlist/cardsearch/?keyword=${card.id}`;
    
    console.log(`[Processing ${i+1}/${cardsData.length}] ID: ${card.id} | Name: ${card.name}`);

    try {
      // Navigate and wait for DOM content (networkidle is too strict on this site)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Try to click the first search result to open the modal
      try {
        await page.waitForSelector('.cardlist-Search_Result li a, .item a', { timeout: 10000 });
        const firstResult = await page.$('.cardlist-Search_Result li a, .item a');
        if (firstResult) {
            await firstResult.click();
        }
      } catch (clickErr) {
        console.log(`  ↳ Warning: Could not find card to click. Proceeding anyway...`);
      }

      // 2. The Golden Rule: Wait for the specific CSR container to exist
      await page.waitForSelector('.cardlist-Detail_Box_Inner .txt .txt-Inner', { timeout: 15000 });

      // 3. Extract the raw HTML of just that container
      const containerHTML = await page.$eval('.cardlist-Detail_Box_Inner .txt .txt-Inner', el => el.outerHTML);
      const $ = cheerio.load(containerHTML);

      // Initialize structured fields securely
      if (!card.attributes) card.attributes = {};
      card.attributes.abilities = [];
      card.attributes.arts = [];
      card.attributes.oshi_skills = [];
      card.attributes.collab_effect = null;
      card.attributes.gift_effect = null;
      card.attributes.bloom_effect = null;

      // 4. Iterate through sibling <div> elements inside the container
      // Since containerHTML is outerHTML, we query '.txt-Inner' as the root wrapper
      $('.txt-Inner').children('div').each((_, el) => {
        const className = $(el).attr('class') || 'no-class';
        const rawHTML = $(el).html();
        const textContent = $(el).text().replace(/\s+/g, ' ').trim();
        
        console.log(`  ↳ Found block with class: [${className}]`);

        if (className.includes('oshi') || className.includes('sp')) {
          card.attributes.oshi_skills.push({ type: className, description: textContent, raw_html: rawHTML });
          console.log(`     ✅ Mapped to: Oshi Skill`);
        } 
        else if (className.includes('art') || className.includes('attack') || className.includes('skill')) {
          if (className.includes('ability')) {
            card.attributes.abilities.push({ rawClass: className, description: textContent, raw_html: rawHTML });
            console.log(`     ✅ Mapped to: Ability`);
          } else {
            card.attributes.arts.push({ rawClass: className, description: textContent, raw_html: rawHTML });
            console.log(`     ✅ Mapped to: Art/Attack`);
          }
        } 
        else if (className.includes('collab') || textContent.toLowerCase().includes('collab effect')) {
          card.attributes.collab_effect = textContent;
          console.log(`     ✅ Mapped to: Collab Effect`);
        } 
        else if (className.includes('gift') || textContent.toLowerCase().includes('gift effect')) {
          card.attributes.gift_effect = textContent;
          console.log(`     ✅ Mapped to: Gift Effect`);
        } 
        else if (className.includes('bloom') || textContent.toLowerCase().includes('bloom effect')) {
          card.attributes.bloom_effect = textContent;
          console.log(`     ✅ Mapped to: Bloom Effect`);
        } 
        else {
          console.log(`     ❓ Unmapped text: "${textContent.substring(0, 40)}..."`);
        }
      });

      updatedCount++;
    } catch (error) {
      console.error(`  ↳ ❌ Error: Failed to process ${card.id}. Reason: ${error.message}`);
      failedCount++;
    }

    // Safety Delay: 2 seconds between each page load to avoid rate limits
    await delay(2000); 
  }

  await browser.close();

  // Save the database
  try {
    fs.writeFileSync(CARDS_FILE_PATH, JSON.stringify(cardsData, null, 2));
    console.log('\n---------------------------------------------------');
    console.log(`🎉 Puppeteer Extraction complete!`);
    console.log(`✅ Successfully extracted data for: ${updatedCount} cards.`);
    console.log(`❌ Failed or skipped: ${failedCount} cards.`);
    console.log('---------------------------------------------------');
  } catch (err) {
    console.error('Fatal Error: Could not save cards.json', err.message);
  }
}

enrichCards();
