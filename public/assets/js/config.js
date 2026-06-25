const SITE_CONFIG = {
    brand: 'SARTORIA',
    tagline: 'Móveis Planejados de Alto Padrão',
    whatsapp: '5549999999999',
    phone: '+5549999999999',
    phoneDisplay: '+55 49 99999-9999',
    email: 'projetos@sartoriamoveis.com.br',
    address: {
        line1: 'Av. Getúlio Vargas, 1200',
        city: 'Chapecó - SC, Brasil',
    },
    defaultMessage: 'Olá! Vim pelo site da Sartoria e gostaria de falar sobre móveis planejados.',
    siteUrl: 'https://www.sartoriamoveis.com.br',
};

function getWhatsAppUrl(message) {
    const text = message || SITE_CONFIG.defaultMessage;
    return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
}

function buildLeadMessage(name, phone, spaces, urgency) {
    const lines = [
        `Olá! Vim pelo site da ${SITE_CONFIG.brand} e gostaria de um atendimento VIP.`,
        '',
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
    ];
    if (spaces.length) lines.push(`Ambientes: ${spaces.join(', ')}`);
    if (urgency) lines.push(`Estágio da obra: ${urgency}`);
    return lines.join('\n');
}
