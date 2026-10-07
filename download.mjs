import fs from 'fs';
import path from 'path';

const images = {
    'banner1.jpg': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1260&q=80',
    'banner2.jpg': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1260&q=80',
    'service1.jpg': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    'service2.jpg': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    'service3.jpg': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
};

async function download() {
    const dir = path.join(process.cwd(), 'public', 'images', 'demo', 'homeservices');
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
