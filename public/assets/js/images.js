/** Caminhos reais das imagens no diretório public/ */
const SITE_IMAGES = {
    hero: '/hero/hero-capa-marrom.webp',
    solucao: '/solucao/solucao-detalhe-marcenaria-blum.jpg',
    anatomiaBg: '/anatomia/anatomia-bg-atelier-escuro.jpg',
    anatomia: [
        '/anatomia/anatomia-01-chapas-premium.jpg',
        '/anatomia/anatomia-02-ferragens-importadas.jpg',
        '/anatomia/anatomia-03-projeto-tecnico-3d.jpg',
        '/anatomia/anatomia-04-instalacao-premium.jpg',
    ],
    execucoes: [
        '/solucao/solucao-detalhe-marcenaria-blum.jpg',
        '/hero/hero-capa-marrom.webp',
        '/execucoes/execucao-03-closet-minimalista-lacca.jpg',
        '/anatomia/anatomia-04-instalacao-premium.jpg',
        '/assets/images/projeto 3d.jpg',
        '/sobre/equipe-obra.jpg',
    ],
    socialOg: '/social/social-og-compartilhamento.webp',
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
