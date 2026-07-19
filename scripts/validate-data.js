import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cardsFile = path.join(__dirname, '../src/data/cards.json');
const cards = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));

const MAX_CONCURRENT = 10;
let currentIndex = 0;

const brokenImages = [];
const missingData = [];

const checkUrl = (url) => {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    }).end();
  });
};

const processNext = async () => {
  if (currentIndex >= cards.length) return;
  const index = currentIndex++;
  const card = cards[index];

  // Check missing data
  if (!card.attributes || card.attributes.text === null) {
    missingData.push(card.id);
  }

  // Check URL
  const isValid = await checkUrl(card.image_url);
  if (!isValid) {
    brokenImages.push({ id: card.id, url: card.image_url });
  }

  await processNext();
};

const run = async () => {
  console.log(`Validating ${cards.length} cards...`);
  const workers = [];
  for (let i = 0; i < MAX_CONCURRENT; i++) {
    workers.push(processNext());
  }
  
  await Promise.all(workers);
  
  console.log('\n--- Validation Report ---');
  console.log(`Broken Images: ${brokenImages.length}`);
  brokenImages.slice(0, 10).forEach(b => console.log(`  [${b.id}] ${b.url}`));
  if (brokenImages.length > 10) console.log(`  ...and ${brokenImages.length - 10} more`);
  
  console.log(`\nMissing Text Data: ${missingData.length}`);
  missingData.slice(0, 10).forEach(id => console.log(`  [${id}]`));
  if (missingData.length > 10) console.log(`  ...and ${missingData.length - 10} more`);
  
  fs.writeFileSync(path.join(__dirname, 'validation_report.json'), JSON.stringify({ brokenImages, missingData }, null, 2));
  console.log('\nFull report saved to scripts/validation_report.json');
};

run();
