const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

async function discoverDOM() {
  const url = 'https://en.hololive-official-cardgame.com/cardlist/?cardno=hBP01-023';
  console.log(`Fetching: ${url}`);
  
  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    const $ = cheerio.load(html);

    // Try to find the container holding the card details.
    let containerHTML = 
        $('.p-card-detail').html() ||
        $('.card-detail').html() || 
        $('.modal-content').html() ||
        $('.l-main').html() ||
        $('main').html() || 
        $('body').html();

    if (containerHTML) {
      containerHTML = containerHTML.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      containerHTML = containerHTML.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
      
      const outputPath = path.join(__dirname, '../sora-dom.txt');
      fs.writeFileSync(outputPath, containerHTML.trim());
      console.log(`Successfully extracted HTML and saved to ${outputPath}`);
    } else {
      console.log('Could not find any main content wrapper.');
    }

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

discoverDOM();
