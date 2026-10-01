const axios = require('axios');
(async () => {
  try {
    const { data } = await axios.get('https://thammyvienngocdung.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    // Quick regex to find img src inside header or logo classes
    const logos = [];
    const headerMatch = data.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      const imgMatch = headerMatch[1].match(/<img[^>]+src="([^">]+)"/g);
      if (imgMatch) {
        imgMatch.forEach(m => {
          const src = m.match(/src="([^">]+)"/)[1];
          logos.push(src);
        });
      }
    }
    
    console.log('Found Logos in Header:', [...new Set(logos)]);
  } catch (e) { console.error(e.message); }
})();
