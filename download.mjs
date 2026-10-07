import fs from 'fs';
import path from 'path';

const images = {
    'banner1.jpg': 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1260&q=80',
    'banner2.jpg': 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1260&q=80',
    'service1.jpg': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    'service2.jpg': 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80',
    'service3.jpg': 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
};

async function download() {
    const dir = path.join(process.cwd(), 'public', 'images', 'demo', 'homestay');
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
