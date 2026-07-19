const fs = require('fs');
const path = require('path');

const RAW_DB_PATH = 'C:/Users/rolan/Documents/Analista de Decks/gacha_test_data.js';
const CLEAN_DB_PATH = path.join(__dirname, '../src/data/cards.json');

try {
  const HOCG_DATA = require(RAW_DB_PATH);
  const cleanCards = JSON.parse(fs.readFileSync(CLEAN_DB_PATH, 'utf8'));

  let ghostCount = 0;
  console.log('--- QA REPORT: GHOST CARDS IN CHEER/STARTER DECKS ---');

  cleanCards.forEach(card => {
    if (card.expansion_id === 'hY' || card.expansion_id.startsWith('hSD')) {
      // Check if it's a ghost variant (has a -SUFFIX in id but it's a Cheer or SD)
      const baseNumber = card.id.split('-').slice(0, 2).join('-');
      if (card.id !== baseNumber) {
        console.log(`WARNING: Ghost Card Detected -> ${card.id}`);
        ghostCount++;
      }
    }
  });

  if (ghostCount === 0) {
    console.log('\nSUCCESS: No ghost cards detected in the cleaned database.');
  } else {
    console.log(`\nFAILURE: Found ${ghostCount} ghost cards!`);
  }

} catch (e) {
  console.error(e);
}
