import fs from 'fs';
import path from 'path';

const images = {
    'service3.jpg': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
};

async function download() {
    const dir = path.join(process.cwd(), 'public', 'images', 'demo', 'pet');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    for (const [name, url] of Object.entries(images)) {
        try {
            const res = await globalThis.fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(path.join(dir, name), Buffer.from(buffer));
            console.log(`Downloaded ${name}`);
        } catch (err) {
            console.error(`Failed to download ${name}:`, err.message);
        }
    }
}
download();
