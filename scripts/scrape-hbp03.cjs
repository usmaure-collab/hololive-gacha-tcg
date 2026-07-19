const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  let all = [];
  for(let i=1; i<=25; i++) {
    const res = await fetch('https://en.hololive-official-cardgame.com/cardlist/cardsearch_ex?expansion=hBP03&view=text&page='+i, {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const items = $('li.ex-item');
    if (items.length === 0) break; // End of pagination

    items.each((_, el) => {
      const img = $(el).find('img').first().attr('src');
      const num = $(el).find('.number').text().trim();
      const name = $(el).find('.name').text().trim();
      const rarity = $(el).find('dt:contains(\'Rarity\')').next('dd').text().trim();
      const type = $(el).find('dt:contains(\'Card Type\')').next('dd').text().trim();
      
      const colors = [];
      $(el).find('dt:contains(\'Color\')').next('dd').find('img').each((_, imgEl) => {
         const alt = $(imgEl).attr('alt');
         if (alt === '白') colors.push('White');
         if (alt === '緑') colors.push('Green');
         if (alt === '赤') colors.push('Red');
         if (alt === '青') colors.push('Blue');
         if (alt === '無') colors.push('Colorless');
      });

      const hp = $(el).find('dt:contains(\'LIFE\')').next('dd').text().trim() || 
                 $(el).find('dt:contains(\'HP\')').next('dd').text().trim();

      all.push({ 
        id: num, 
        name, 
        rarity: rarity || 'Unknown', 
        card_type: type, 
        attributes: { color: colors, hp: hp || undefined },
        expansion_id: 'hBP03',
        image_url: 'https://en.hololive-official-cardgame.com' + img 
      });
    });
  }
  fs.writeFileSync('hbp03_scraped.json', JSON.stringify(all, null, 2));
  console.log('Scraped:', all.length);
  const counts = {};
  all.forEach(c => counts[c.rarity] = (counts[c.rarity]||0)+1);
  console.log(counts);
})();
