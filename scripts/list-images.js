#!/usr/bin/env node
/** Lista imagens encontradas em public/assets/images/ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'assets', 'images');
const EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

function walk(dir) {
    const found = [];
    if (!fs.existsSync(dir)) return found;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) found.push(...walk(full));
        else if (EXT.has(path.extname(entry.name).toLowerCase())) {
            found.push(full.replace(path.join(__dirname, '..', 'public'), '').replace(/\\/g, '/'));
        }
    }
    return found;
}

const images = walk(ROOT);
console.log(`\nImagens em public/assets/images/: ${images.length}\n`);
images.forEach((p) => console.log(' ', p));
if (!images.length) {
    console.log('  (nenhuma — coloque os arquivos nas pastas 01-hero … 05-social)\n');
}
process.exit(images.length ? 0 : 1);
