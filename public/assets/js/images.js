/** Caminhos reais das imagens (extensão correta: jpg/png) */
const SITE_IMAGES = {
    hero: '/assets/images/01-hero/hero-capa-marrom.png',
    solucao: '/assets/images/02-solucao/solucao-detalhe-marcenaria-blum.jpg',
    anatomiaBg: '/assets/images/03-anatomia/anatomia-bg-atelier-escuro.jpg',
    anatomia: [
        '/assets/images/03-anatomia/anatomia-01-chapas-premium.jpg',
        '/assets/images/03-anatomia/anatomia-02-ferragens-importadas.jpg',
        '/assets/images/03-anatomia/anatomia-03-projeto-tecnico-3d.jpg',
        '/assets/images/03-anatomia/anatomia-04-instalacao-premium.jpg',
    ],
    execucoes: [
        '/assets/images/04-execucoes/execucao-01-cozinha-gourmet-nogueira.jpg',
        '/assets/images/04-execucoes/execucao-02-living-painel-ripado.png',
        '/assets/images/04-execucoes/execucao-03-closet-minimalista-lacca.jpg',
    ],
    socialOg: '/assets/images/05-social/social-og-compartilhamento.png',
};

function hydrateSiteImages() {
    const hero = document.querySelector('.hero-section');
    if (hero) hero.style.backgroundImage = `url('${SITE_IMAGES.hero}')`;

    const anatomiaSection = document.getElementById('diferenciais');
    if (anatomiaSection) anatomiaSection.style.backgroundImage = `url('${SITE_IMAGES.anatomiaBg}')`;

    const solucaoImg = document.querySelector('#solucao figure img');
    if (solucaoImg) solucaoImg.src = SITE_IMAGES.solucao;

    document.querySelectorAll('.anatomy-card .xray-img').forEach((img, i) => {
        if (SITE_IMAGES.anatomia[i]) img.src = SITE_IMAGES.anatomia[i];
    });

    document.querySelectorAll('.portfolio-item .portfolio-img').forEach((img, i) => {
        if (SITE_IMAGES.execucoes[i]) img.src = SITE_IMAGES.execucoes[i];
    });

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.content = new URL(SITE_IMAGES.socialOg, window.location.origin).href;
}
