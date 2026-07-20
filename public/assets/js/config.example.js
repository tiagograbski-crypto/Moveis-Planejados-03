/**
 * Copie este arquivo para config.js e ajuste os valores do cliente.
 * config.js é versionado com placeholders — substitua antes do deploy.
 */
const SITE_CONFIG = {
    brand: 'Sua Marca',
    tagline: 'Móveis Planejados de Alto Padrão',
    whatsapp: '5549999999999',
    phone: '+5549999999999',
    phoneDisplay: '(49) 99999-9999',
    email: 'contato@seusite.com.br',
    address: {
        line1: 'Av. Getúlio Vargas, 1200',
        city: 'Chapecó - SC, Brasil',
        footerRegion: 'Brasil',
    },
    defaultMessage: 'Olá! Vim pelo site e gostaria de solicitar uma consultoria privada de móveis planejados.',
    siteUrl: 'https://www.seusite.com.br',
};

const PLACEHOLDER_WHATSAPP = '5549999999999';

function isWhatsAppConfigured() {
    const digits = String(SITE_CONFIG.whatsapp || '').replace(/\D/g, '');
    if (!digits || digits.length < 12) return false;
    if (digits === PLACEHOLDER_WHATSAPP) return false;
    if (/9{6,}/.test(digits)) return false;
    return true;
}

function getWhatsAppUrl(message) {
    const text = message || SITE_CONFIG.defaultMessage;
    return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function buildLeadMessage(name, phone, spaces, urgency) {
    const lines = [
        `Olá! Vim pelo site da ${SITE_CONFIG.brand} e gostaria de solicitar uma consultoria privada.`,
        '',
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
    ];
    if (spaces.length) lines.push(`Ambientes: ${spaces.join(', ')}`);
    if (urgency) lines.push(`Momento do projeto: ${urgency}`);
    return lines.join('\n');
}
