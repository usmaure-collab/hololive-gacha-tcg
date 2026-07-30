const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const CARDS_FILE_PATH = path.join(__dirname, '../src/data/cards.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function enrichCards() {
  console.log('Loading cards data...');
  let cardsData = [];
  try {
    cardsData = JSON.parse(fs.readFileSync(CARDS_FILE_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading cards.json:', error);
    process.exit(1);
  }

  console.log(`Starting fast enrichment for ${cardsData.length} cards...`);

  let modifiedCount = 0;
  const axiosInstance = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 10000
  });

  for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];
    
    // Skip cheers as they rarely have complex abilities
    if (card.card_type === 'Cheer') {
      continue;
    }

    console.log(`[${i + 1}/${cardsData.length}] Processing ${card.id} (${card.name})...`);

    try {
      // 1. Find internal web ID via search
      const searchUrl = `https://en.hololive-official-cardgame.com/cardlist/cardsearch/?keyword=${encodeURIComponent(card.id)}`;
      const { data: searchHtml } = await axiosInstance.get(searchUrl);
      const $search = cheerio.load(searchHtml);

      // Grab the first matching detail link
      const detailLink = $search('.cardlist-Result_List a').first().attr('href');

      if (!detailLink) {
        console.log(`  -> No search result found for ${card.id}`);
        await delay(300);
        continue;
      }

      // 2. Fetch full detail HTML
      const detailUrl = `https://en.hololive-official-cardgame.com${detailLink}`;
      const { data: detailHtml } = await axiosInstance.get(detailUrl);
      const $detail = cheerio.load(detailHtml);

      const textInner = $detail('.txt-Inner');
      if (!textInner.length) {
        console.log(`  -> No detail box found for ${card.id}`);
        await delay(300);
        continue;
      }

      // 3. Extract text details
      const oshiSkills = [];
      const arts = [];
      const abilities = [];
      let fullText = [];

      textInner.find('div, p, dt, dd').each((_, el) => {
        const text = $detail(el).text().trim();
        if (text && text.length > 5 && !fullText.includes(text)) {
          fullText.push(text);
          if (text.includes('Oshi Skill') || text.includes('SP Oshi Skill')) {
            oshiSkills.push({ description: text });
          } else if (text.toLowerCase().includes('arts') || text.includes('Arts+')) {
            arts.push({ description: text });
          } else if (text.includes('1/Turn') || text.includes('1/Game') || text.toLowerCase().includes('effect')) {
            abilities.push({ description: text });
          }
        }
      });

      card.attributes = {
        ...card.attributes,
        text: fullText.join('\n'),
        oshi_skills: oshiSkills.length > 0 ? oshiSkills : card.attributes?.oshi_skills,
        arts: arts.length > 0 ? arts : card.attributes?.arts,
        abilities: abilities.length > 0 ? abilities : card.attributes?.abilities
      };

      modifiedCount++;
      console.log(`  -> Successfully enriched ${card.id}`);

    } catch (err) {
      console.log(`  -> Error processing ${card.id}: ${err.message}`);
    }

    // Polite delay (300ms) to run super fast while being respectful
    await delay(300);
  }

  if (modifiedCount > 0) {
    fs.writeFileSync(CARDS_FILE_PATH, JSON.stringify(cardsData, null, 2), 'utf8');
    console.log(`\n🎉 ENRICHMENT COMPLETE! Updated ${modifiedCount} cards in cards.json`);
  } else {
    console.log('\nNo updates were made.');
  }
}

enrichCards().catch(console.error);
