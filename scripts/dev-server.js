const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { PUBLIC_DIR } = require('./lib/project-paths');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // Mudado para localhost padrão para segurança
const ROOT = PUBLIC_DIR;

// Cache de arquivos estáticos para melhor performance
const fileCache = new Map();
const CACHE_TTL = 5000; // 5 segundos para assets de desenvolvimento

// Extensões MIME completas
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
};

// Headers de segurança para produção/desenvolvimento
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Cabeçalhos específicos para development
const DEV_HEADERS = {
    ...SECURITY_HEADERS,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

// Headers para arquivos estáticos em produção
const STATIC_HEADERS = (ext) => ({
    ...SECURITY_HEADERS,
    'Cache-Control': MIME[ext] ? 'public, max-age=604800, immutable' : 'no-cache',
});

// Função para obter IPs locais com melhor formatação
function getLocalIPs() {
    const ips = [];
    const interfaces = os.networkInterfaces();
    
    for (const [name, nets] of Object.entries(interfaces)) {
        for (const net of nets || []) {
            if (net.family === 'IPv4' && !net.internal) {
                ips.push({
                    address: net.address,
                    interface: name,
                    netmask: net.netmask
                });
            }
        }
    }
    
    return ips;
}

// Sanitização de caminho de arquivo com proteção contra ataques
function sanitizePath(urlPath) {
    try {
        const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
        const relativePath = decoded.replace(/^[/\\]+/, '');

        if (!relativePath || relativePath.includes('..') || relativePath.includes('\0')) {
            return null;
        }

        const normalized = path.normalize(relativePath);

        if (normalized.includes('..') || normalized.includes('\0')) {
            return null;
        }

        const fullPath = path.resolve(ROOT, normalized);
        const rootResolved = path.resolve(ROOT);

        if (fullPath !== rootResolved && !fullPath.startsWith(rootResolved + path.sep)) {
            return null;
        }

        return fullPath;
    } catch (error) {
        console.error('❌ Erro ao sanitizar caminho:', urlPath, error.message);
        return null;
    }
}

// Determinar se é um arquivo de desenvolvimento
function isDevAsset(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.js' || ext === '.css' || ext === '.html' || ext === '.mjs';
}

// Verificar se arquivo existe e é um arquivo regular
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}

// Verificar se é uma solicitação para API ou não-arquivo
function isApiRequest(url) {
    return url.startsWith('/api/') || url.startsWith('/webhook/');
}

// Logger de requisições
function logRequest(req, res, startTime) {
    const method = req.method;
    const url = req.url;
    const status = res.statusCode;
    const responseTime = Date.now() - startTime;
    const userAgent = req.headers['user-agent'] || 'Desconhecido';
    const referer = req.headers['referer'] || 'Direto';
    
    const statusColor = 
        status >= 200 && status < 300 ? '\x1b[32m' : // Verde para sucesso
        status >= 300 && status < 400 ? '\x1b[33m' : // Amarelo para redirecionamento
        '\x1b[31m'; // Vermelho para erro
    
    console.log(
        `${statusColor}${status}\x1b[0m ${method} ${url} \x1b[90m(${responseTime}ms)\x1b[0m\n` +
        `  └─ Referência: ${referer}\n` +
        `  └─ Cliente: ${userAgent.substring(0, 60)}${userAgent.length > 60 ? '...' : ''}`
    );
}

// Manipulador de erros centralizado
function handleError(res, error, statusCode = 500) {
    console.error('❌ Erro no servidor:', error);
    
    const errorPage = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Erro ${statusCode} - Tendência</title>
            <style>
                body { 
                    margin: 0; padding: 2rem; 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f8f9fa; color: #333; 
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    min-height: 100vh; text-align: center;
                }
                .error-container { 
                    max-width: 600px; 
                    background: white; 
                    padding: 3rem; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                h1 { margin-bottom: 1rem; color: #d32f2f; }
                p { color: #666; line-height: 1.6; margin-bottom: 1.5rem; }
                .error-code { font-size: 4rem; font-weight: bold; color: #d32f2f; margin: 0; }
                .home-link { 
                    display: inline-block; 
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: #b78358; color: white;
                    text-decoration: none; border-radius: 6px;
                    font-weight: 500; transition: background 0.2s;
                }
                .home-link:hover { background: #976746; }
            </style>
        </head>
        <body>
            <div class="error-container">
                <h1 class="error-code">${statusCode}</h1>
                <h2>Oops! Algo deu errado</h2>
                <p>Tivemos um problema ao processar sua solicitação. Por favor, tente novamente.</p>
                <p><small>Detalhes técnicos: ${error.message}</small></p>
                <a href="/" class="home-link">Voltar para a página inicial</a>
            </div>
        </body>
        </html>
    `;
    
    res.writeHead(statusCode, {
        'Content-Type': 'text/html; charset=utf-8',
        ...DEV_HEADERS
    });
    res.end(errorPage);
}

// Cache de arquivos com expiração
function getCachedFile(filePath) {
    const cached = fileCache.get(filePath);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedFile(filePath, data) {
    fileCache.set(filePath, {
        data: data,
        timestamp: Date.now()
    });
}

// Limpar cache periodicamente
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of fileCache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
            fileCache.delete(key);
        }
    }
}, CACHE_TTL);

// Criar servidor HTTP com melhorias
const server = http.createServer((req, res) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;
    
    // Log da requisição
    req.on('end', () => {
        logRequest(req, res, startTime);
    });
    
    // Verificar método HTTP
    if (!['GET', 'HEAD'].includes(method)) {
        handleError(res, new Error(`Método ${method} não permitido`), 405);
        return;
    }
    
    // Verificar se é uma requisição de API (retornar 404)
    if (isApiRequest(url)) {
        handleError(res, new Error('API endpoint não implementado'), 404);
        return;
    }
    
    // Sanitizar e resolver caminho do arquivo
    const filePath = sanitizePath(url === '/' ? '/index.html' : url);
    
    if (!filePath) {
        handleError(res, new Error('Caminho inválido ou não permitido'), 403);
        return;
    }
    
    // Verificar se o arquivo existe
    if (!fileExists(filePath)) {
        // Tentar servir index.html para SPA routing
        if (url !== '/' && !path.extname(filePath)) {
            const indexPath = path.join(ROOT, 'index.html');
            if (fileExists(indexPath)) {
                fs.readFile(indexPath, (err, data) => {
                    if (err) {
                        handleError(res, err, 404);
                        return;
                    }
                    
                    const headers = {
                        'Content-Type': MIME['.html'] || 'text/html; charset=utf-8',
                        ...DEV_HEADERS,
                        'X-Served-As': 'SPA Fallback'
                    };
                    
                    res.writeHead(200, headers);
                    res.end(data);
                });
                return;
            }
        }
        
        handleError(res, new Error('Arquivo não encontrado'), 404);
        return;
    }
    
    // Tentar obter do cache primeiro
    const cachedData = getCachedFile(filePath);
    if (cachedData) {
        const ext = path.extname(filePath).toLowerCase();
        const headers = {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            ...(isDevAsset(filePath) ? DEV_HEADERS : STATIC_HEADERS(ext)),
            'X-Cache': 'HIT'
        };
        
        res.writeHead(200, headers);
        res.end(cachedData);
        return;
    }
    
    // Ler arquivo do disco
    fs.readFile(filePath, (err, data) => {
        if (err) {
            handleError(res, err, 500);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const headers = {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            ...(isDevAsset(filePath) ? DEV_HEADERS : STATIC_HEADERS(ext)),
            'X-Cache': 'MISS'
        };
        
        // Cache para próxima requisição
        setCachedFile(filePath, data);
        
        res.writeHead(200, headers);
        res.end(data);
    });
});

// Manipulador de erros do servidor
server.on('error', (error) => {
    console.error('⚠️  Erro crítico no servidor:', error);
    
    if (error.code === 'EADDRINUSE') {
        console.error(`⚠️  Porta ${PORT} já está em uso. Tente uma das opções:`);
        console.error(`   1. Execute: PORT=${PORT + 1} npm start`);
        console.error(`   2. Mate o processo usando a porta ${PORT}`);
        console.error(`   3. Aguarde alguns segundos e tente novamente`);
        process.exit(1);
    }
});

// Graceful shutdown
function gracefulShutdown() {
    console.log('\n\n⏳ Encerrando servidor...');
    
    // Parar de aceitar novas conexões
    server.close((err) => {
        if (err) {
            console.error('❌ Erro ao encerrar servidor:', err);
            process.exit(1);
        }
        
        console.log('✅ Servidor encerrado com sucesso.');
        process.exit(0);
    });
    
    // Timeout de 5 segundos para encerramento forçado
    setTimeout(() => {
        console.error('⚠️  Forçando encerramento do servidor...');
        process.exit(1);
    }, 5000);
}

// Capturar sinais de encerramento
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Iniciar servidor
server.listen(PORT, HOST, () => {
    const ips = getLocalIPs();
    
    console.clear();
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║               🚀 SERVIDOR DE DESENVOLVIMENTO             ║');
    console.log('║                    TENDÊNCIA LANDING                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 INFORMAÇÕES DO SISTEMA:');
    console.log(`   • Sistema: ${os.platform()} ${os.release()}`);
    console.log(`   • Memória: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB RAM`);
    console.log(`   • CPU: ${os.cpus()[0].model}`);
    console.log('\n🌐 ENDEREÇOS DISPONÍVEIS:');
    
    // Endereços principais
    console.log(`   📱 Desktop Principal:`);
    console.log(`        \x1b[32mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`        \x1b[32mhttp://${HOST}:${PORT}\x1b[0m`);
    
    if (ips.length > 0) {
        console.log(`\n   📲 Mobile (mesma rede):`);
        ips.forEach((ipInfo, index) => {
            console.log(`        \x1b[36mhttp://${ipInfo.address}:${PORT}\x1b[0m`);
            console.log(`          ↳ Interface: ${ipInfo.interface}`);
            console.log(`          ↳ Máscara: ${ipInfo.netmask}\n`);
        });
    } else {
        console.log(`\n   ⚠️  Mobile: Nenhuma interface de rede detectada`);
    }
    
    console.log('\n📁 CONFIGURAÇÃO:');
    console.log(`   • Porta: ${PORT}`);
    console.log(`   • Host: ${HOST}`);
    console.log(`   • Diretório: ${ROOT}`);
    console.log(`   • Cache: Ativo (${CACHE_TTL}ms TTL)`);
    
    console.log('\n🔧 COMANDOS ÚTEIS:');
    console.log(`   • Altere a porta: \x1b[33mPORT=4000 npm start\x1b[0m`);
    console.log(`   • Teste apenas local: \x1b[33mHOST=127.0.0.1 npm start\x1b[0m`);
    console.log(`   • Rede completa: \x1b[33mHOST=0.0.0.0 npm start\x1b[0m`);
    
    console.log('\n📝 STATS EM TEMPO REAL:');
    console.log(`   • Conectado em: ${new Date().toLocaleTimeString('pt-BR')}`);
    console.log(`   • Status: \x1b[32m✅ Ativo e escutando\x1b[0m`);
    
    console.log('\n⚠️  COMANDOS DE CONTROLE:');
    console.log(`   • \x1b[31mCtrl+C\x1b[0m  →  Parar servidor`);
    console.log(`   • \x1b[33mCtrl+\\\x1b[0m  →  Reinício forçado`);
    
    console.log('\n📈 MONITORAMENTO:');
    console.log('   • Requisições são automaticamente logadas');
    console.log('   • Erros são tratados com páginas customizadas');
    console.log('   • Cache ativo para melhor performance\n');
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           🎯 Preparado para desenvolvimento!             ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
});

// Health check endpoint (para ferramentas externas)
server.on('request', (req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connections: server.connections
        }));
    }
});
