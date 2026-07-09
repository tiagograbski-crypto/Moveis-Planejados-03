// Utilitários avançados para o servidor de desenvolvimento
// ===========================================================================

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Cache de arquivos com expiração
class FileCache {
    constructor(ttl = 5000, maxSize = 50 * 1024 * 1024) {
        this.cache = new Map();
        this.ttl = ttl;
        this.maxSize = maxSize;
        this.currentSize = 0;
        
        // Limpeza periódica
        this.cleanupInterval = setInterval(() => this.cleanup(), this.ttl * 2);
    }
    
    async set(key, data) {
        const size = Buffer.byteLength(data, 'utf8');
        
        // Verificar se excede o tamanho máximo
        if (this.currentSize + size > this.maxSize) {
            this.evictOldest();
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            size
        });
        
        this.currentSize += size;
    }
    
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            this.currentSize -= cached.size;
            return null;
        }
        
        return cached.data;
    }
    
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            const cached = this.cache.get(oldestKey);
            this.cache.delete(oldestKey);
            this.currentSize -= cached.size;
        }
    }
    
    cleanup() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.ttl * 2) {
                this.cache.delete(key);
                this.currentSize -= value.size;
            }
        }
    }
    
    clear() {
        this.cache.clear();
        this.currentSize = 0;
    }
    
    stats() {
        return {
            size: this.cache.size,
            memoryUsage: this.currentSize,
            maxMemory: this.maxSize,
            hitRate: this.calculateHitRate()
        };
    }
    
    calculateHitRate() {
        // Implementar tracking de hits/misses se necessário
        return 0;
    }
}

// Logger avançado
class ServerLogger {
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        
        this.colors = {
            error: '\x1b[31m', // Vermelho
            warn: '\x1b[33m',  // Amarelo
            info: '\x1b[32m', // Verde
            debug: '\x1b[36m', // Ciano
            reset: '\x1b[0m'
        };
    }
    
    log(level, message, metadata = {}) {
        const timestamp = new Date().toISOString();
        const color = this.colors[level] || '';
        const reset = this.colors.reset;
        
        const logMessage = `[${timestamp}] ${color}${level.toUpperCase()}${reset}: ${message}`;
        
        if (Object.keys(metadata).length > 0) {
            console.log(logMessage, JSON.stringify(metadata, null, 2));
        } else {
            console.log(logMessage);
        }
    }
    
    error(message, error = null) {
        this.log('error', message, error ? { error: error.message, stack: error.stack } : {});
    }
    
    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }
    
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }
    
    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }
    
    request(req, res, responseTime) {
        const status = res.statusCode;
        const method = req.method;
        const url = req.url;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const referer = req.headers['referer'] || 'Direct';
        
        const level = status >= 500 ? 'error' : 
                     status >= 400 ? 'warn' : 'info';
        
        this.log(level, `${method} ${url} - ${status} (${responseTime}ms)`, {
            status,
            method,
            url,
            responseTime,
            userAgent: userAgent.substring(0, 100),
            referer
        });
    }
}

// Utilitários de rede
class NetworkUtils {
    static getLocalIPs() {
        const interfaces = os.networkInterfaces();
        const ips = [];
        
        for (const [name, nets] of Object.entries(interfaces)) {
            for (const net of nets || []) {
                if (net.family === 'IPv4' && !net.internal) {
                    ips.push({
                        address: net.address,
                        interface: name,
                        netmask: net.netmask,
                        mac: net.mac,
                        cidr: `${net.address}/${this.netmaskToCIDR(net.netmask)}`
                    });
                }
            }
        }
        
        return ips;
    }
    
    static netmaskToCIDR(netmask) {
        const parts = netmask.split('.').map(Number);
        return parts.reduce((count, part) => {
            return count + Math.clz32(~part << 24);
        }, 0);
    }
    
    static getNetworkInfo() {
        const ips = this.getLocalIPs();
        const hostname = os.hostname();
        const platform = os.platform();
        const release = os.release();
        
        return {
            hostname,
            platform,
            release,
            interfaces: ips,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            cpus: os.cpus().length,
            loadavg: os.loadavg()
        };
    }
}

// Utilitários de segurança
class SecurityUtils {
    static sanitizePath(inputPath, rootDir) {
        try {
            const decoded = decodeURIComponent(inputPath.split('?')[0].split('#')[0]);
            const relativePath = decoded.replace(/^[/\\]+/, '');

            if (!relativePath ||
                relativePath.includes('..') ||
                relativePath.includes('\\0') ||
                relativePath.includes('%00') ||
                relativePath.includes('\0')) {
                return null;
            }

            const normalized = path.normalize(relativePath);

            if (normalized.includes('..') ||
                normalized.includes('\\0') ||
                normalized.includes('%00') ||
                normalized.includes('\0')) {
                return null;
            }

            const fullPath = path.resolve(rootDir, normalized);
            const rootResolved = path.resolve(rootDir);

            if (fullPath !== rootResolved && !fullPath.startsWith(rootResolved + path.sep)) {
                return null;
            }

            return fullPath;
        } catch (error) {
            return null;
        }
    }
    
    static isMaliciousRequest(req) {
        const userAgent = req.headers['user-agent'] || '';
        const path = req.url;
        
        // Lista de user-agents maliciosos conhecidos
        const maliciousAgents = [
            'sqlmap',
            'nmap',
            'masscan',
            'nikto',
            'acunetix',
            'wpscan',
            'nessus',
            'metasploit'
        ];
        
        // Verificar user-agent
        const isMaliciousAgent = maliciousAgents.some(agent => 
            userAgent.toLowerCase().includes(agent.toLowerCase())
        );
        
        // Verificar caminhos suspeitos
        const suspiciousPaths = [
            '/admin',
            '/wp-admin',
            '/phpmyadmin',
            '/.env',
            '/config',
            '/backup',
            '/.git'
        ];
        
        const isSuspiciousPath = suspiciousPaths.some(suspicious => 
            path.toLowerCase().includes(suspicious)
        );
        
        return isMaliciousAgent || isSuspiciousPath;
    }
    
    static getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        };
    }
}

// Utilitários de performance
class PerformanceUtils {
    static startTimer() {
        return {
            start: process.hrtime(),
            startTime: Date.now()
        };
    }
    
    static endTimer(timer) {
        const diff = process.hrtime(timer.start);
        const nanoseconds = diff[0] * 1e9 + diff[1];
        const milliseconds = nanoseconds / 1e6;
        
        return {
            time: milliseconds,
            nanoseconds,
            startTime: timer.startTime,
            endTime: Date.now()
        };
    }
    
    static formatResponseTime(ms) {
        if (ms < 1) return `${ms.toFixed(2)}ms`;
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    }
}

// Exportar utilitários
module.exports = {
    FileCache,
    ServerLogger,
    NetworkUtils,
    SecurityUtils,
    PerformanceUtils
};