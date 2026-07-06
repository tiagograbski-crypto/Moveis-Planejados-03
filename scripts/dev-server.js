const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { PUBLIC_DIR } = require('./lib/project-paths');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = PUBLIC_DIR;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
};

function getLocalIPs() {
    const ips = [];
    for (const nets of Object.values(os.networkInterfaces())) {
        for (const net of nets || []) {
            if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
        }
    }
    return ips;
}

function resolveFile(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(ROOT, safePath === path.sep ? 'index.html' : safePath);
    if (!filePath.startsWith(ROOT)) return null;
    return filePath;
}

const server = http.createServer((req, res) => {
    const filePath = resolveFile(req.url === '/' ? '/index.html' : req.url);

    if (!filePath) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (path.extname(filePath) === '') {
                fs.readFile(path.join(ROOT, 'index.html'), (err2, indexData) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end('Not found');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': MIME['.html'] });
                    res.end(indexData);
                });
                return;
            }
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const isDevAsset = ext === '.js' || ext === '.css' || ext === '.html';
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': isDevAsset ? 'no-cache' : 'public, max-age=3600',
        });
        res.end(data);
    });
});

server.listen(PORT, HOST, () => {
    const ips = getLocalIPs();
    console.log('');
    console.log('  Tendência Landing — servidor de desenvolvimento');
    console.log('  =============================================');
    console.log(`  Desktop:  http://localhost:${PORT}`);
    ips.forEach((ip) => console.log(`  Mobile:   http://${ip}:${PORT}`));
    console.log('');
    console.log('  Pasta servida: public/');
    console.log('  Celular na mesma rede Wi-Fi. Ctrl+C para parar.');
    console.log('');
});
