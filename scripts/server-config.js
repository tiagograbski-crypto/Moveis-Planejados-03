// Configurações avançadas do servidor de desenvolvimento
// ===========================================================================

module.exports = {
    // Configurações básicas
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    
    // Diretórios
    publicDir: './public',
    cacheDir: './.cache',
    logsDir: './logs',
    
    // Configurações de performance
    cache: {
        enabled: true,
        ttl: 5000, // 5 segundos para arquivos de desenvolvimento
        maxSize: 50 * 1024 * 1024, // 50MB máximo de cache
        extensions: ['.js', '.css', '.html', '.svg', '.png', '.jpg', '.webp']
    },
    
    // Configurações de segurança
    security: {
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        },
        rateLimit: {
            enabled: true,
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 1000 // limite de requisições por IP
        }
    },
    
    // Configurações de logging
    logging: {
        level: 'info',
        format: 'combined', // 'combined', 'common', 'dev', 'short', 'tiny'
        file: {
            enabled: false,
            maxSize: '10m',
            maxFiles: '14d'
        }
    },
    
    // Configurações de desenvolvimento
    development: {
        liveReload: true,
        hotReload: false,
        openBrowser: false,
        overlayErrors: true
    },
    
    // Configurações de compressão
    compression: {
        enabled: true,
        threshold: 1024,
        level: 6
    },
    
    // Configurações de CORS
    cors: {
        enabled: true,
        origin: '*',
        methods: ['GET', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // Health check
    healthCheck: {
        enabled: true,
        endpoint: '/health',
        interval: 30000 // 30 segundos
    },
    
    // Configurações de timeout
    timeouts: {
        connection: 30000, // 30 segundos
        headers: 10000,   // 10 segundos
        request: 10000    // 10 segundos
    },
    
    // Blacklist de IPs/User-Agents
    blacklist: {
        ips: [],
        userAgents: [
            'masscan',
            'nmap',
            'sqlmap',
            'nikto',
            'acunetix'
        ]
    },
    
    // Whitelist para recursos específicos
    whitelist: {
        extensions: [
            '.html', '.htm', '.js', '.mjs', '.css', '.json',
            '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
            '.ico', '.woff', '.woff2', '.ttf', '.otf',
            '.txt', '.xml', '.pdf', '.mp4', '.webm', '.mp3', '.wav'
        ]
    },
    
    // Configurações de monitoramento
    monitoring: {
        enabled: true,
        metrics: {
            memory: true,
            cpu: true,
            requests: true,
            responseTime: true
        },
        alerts: {
            memoryThreshold: 0.8, // 80% de uso de memória
            cpuThreshold: 0.7     // 70% de uso de CPU
        }
    },
    
    // Configurações de SSL (para desenvolvimento HTTPS)
    ssl: {
        enabled: false,
        key: './certs/server.key',
        cert: './certs/server.crt',
        passphrase: null
    },
    
    // Configurações de proxy reverso
    proxy: {
        enabled: false,
        targets: {
            '/api': 'http://localhost:3001',
            '/uploads': 'http://localhost:3002'
        }
    }
};

// Validação da configuração
function validateConfig(config) {
    const errors = [];
    
    if (config.port < 1024 || config.port > 65535) {
        errors.push('Porta deve estar entre 1024 e 65535');
    }
    
    if (!['development', 'production', 'test'].includes(config.environment)) {
        errors.push('Ambiente deve ser development, production ou test');
    }
    
    if (config.cache.ttl < 1000) {
        errors.push('TTL do cache deve ser pelo menos 1000ms');
    }
    
    if (errors.length > 0) {
        console.error('❌ Erros na configuração:');
        errors.forEach(error => console.error(`   • ${error}`));
        process.exit(1);
    }
}

// Exportar configuração validada
const config = module.exports;
validateConfig(config);
module.exports = config;