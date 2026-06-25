'use strict';

const cursor = document.getElementById('custom-cursor');
const cursorText = document.getElementById('cursor-text');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const actionBar = document.getElementById('mobile-action-bar');
const modal = document.getElementById('lead-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');
const lightbox = document.getElementById('portfolio-lightbox');

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
const SPOTLIGHT_CAROUSEL = window.matchMedia('(max-width: 767px)');
const SPOTLIGHT_MOTION = REDUCED_MOTION;

let cursorInitialized = false;
let lastScrollTop = 0;
let mobileMenuOpen = false;
let lastFocusedElement = null;
let activeFocusTrap = null;
let focusTrapContainer = null;

function isFinePointer() {
    return window.matchMedia('(pointer: fine)').matches;
}

function getFocusableElements(container) {
    return [...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);
}

function trapFocus(container) {
    releaseFocusTrap();
    focusTrapContainer = container;
    activeFocusTrap = (event) => {
        if (event.key !== 'Tab') return;
        const focusable = getFocusableElements(container);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };
    container.addEventListener('keydown', activeFocusTrap);
}

function releaseFocusTrap() {
    if (!activeFocusTrap || !focusTrapContainer) return;
    focusTrapContainer.removeEventListener('keydown', activeFocusTrap);
    activeFocusTrap = null;
    focusTrapContainer = null;
}

function restoreFocus() {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus({ preventScroll: true });
    }
    lastFocusedElement = null;
}

function showStepError(errorId, message) {
    const error = document.getElementById(errorId);
    if (!error) return;
    error.textContent = message;
    error.classList.add('visible');
}

function clearStepErrors() {
    ['error-step-1', 'error-step-2'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('visible');
            el.textContent = '';
        }
    });
}

function hydrateContactLinks() {
    const phoneLink = document.getElementById('contact-phone');
    if (phoneLink) {
        phoneLink.href = `tel:${SITE_CONFIG.phone}`;
        phoneLink.textContent = SITE_CONFIG.phoneDisplay;
    }

    const emailLink = document.getElementById('contact-email');
    if (emailLink) {
        emailLink.href = `mailto:${SITE_CONFIG.email}`;
        emailLink.textContent = SITE_CONFIG.email;
    }

    const addressEl = document.getElementById('contact-address');
    if (addressEl) {
        addressEl.innerHTML = `${SITE_CONFIG.address.line1}<br>${SITE_CONFIG.address.footerRegion || 'Brasil'}`;
    }
}

function hydrateSeoMeta() {
    const url = SITE_CONFIG.siteUrl.replace(/\/$/, '') + '/';
    const canonical = document.getElementById('canonical-url');
    const ogUrl = document.getElementById('og-url');
    if (canonical) canonical.href = url;
    if (ogUrl) ogUrl.content = url;

    const schemaEl = document.getElementById('schema-local-business');
    if (schemaEl) {
        try {
            const schema = JSON.parse(schemaEl.textContent);
            schema.url = url;
            schema.telephone = SITE_CONFIG.phone;
            schema.email = SITE_CONFIG.email;
            schema.address.streetAddress = SITE_CONFIG.address.line1;
            schema.address.addressLocality = SITE_CONFIG.address.city.split(' - ')[0] || 'Chapecó';
            schemaEl.textContent = JSON.stringify(schema);
        } catch (_) { /* noop */ }
    }
}

function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (!input || !error) return;
    input.classList.add('input-error');
    error.textContent = message;
    error.classList.add('visible');
}

function clearFieldErrors() {
    document.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
    document.querySelectorAll('.form-error').forEach((el) => {
        el.classList.remove('visible');
        el.textContent = '';
    });
}

// --- Scroll ---
window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progressBar = document.getElementById('progress-bar');
    const header = document.getElementById('header');

    if (progressBar) {
        progressBar.style.width = `${(winScroll / Math.max(height, 1)) * 100}%`;
    }
    if (header) {
        header.classList.toggle('shadow-glass', winScroll > 50);
    }

    if (!actionBar) return;
    if (winScroll > lastScrollTop && winScroll > 100) {
        actionBar.style.transform = 'translateY(100%)';
    } else {
        actionBar.style.transform = 'translateY(0)';
    }
    lastScrollTop = winScroll <= 0 ? 0 : winScroll;
}, { passive: true });

// --- Custom cursor (decorativo — não oculta cursor nativo) ---
if (isFinePointer() && cursor && !REDUCED_MOTION.matches) {
    document.addEventListener('mousemove', (e) => {
        if (!cursorInitialized) {
            cursor.classList.remove('opacity-0');
            cursorInitialized = true;
        }
        cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    document.querySelectorAll('.portfolio-item').forEach((item) => {
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-expand');
            cursorText.classList.remove('opacity-0');
            cursorText.classList.add('opacity-100');
        });
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-expand');
            cursorText.classList.add('opacity-0');
            cursorText.classList.remove('opacity-100');
        });
    });
}

// --- Mobile menu ---
function closeMobileMenu() {
    if (!mobileMenuOpen || !mobileMenu || !mobileMenuBtn) return;
    mobileMenuOpen = false;
    mobileMenu.classList.remove('opacity-100', 'translate-x-0', 'pointer-events-auto');
    mobileMenu.classList.add('opacity-0', 'translate-x-full', 'pointer-events-none');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-xmark', 'rotate-90');
        icon.classList.add('fa-bars');
    }
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    if (modal && !modal.classList.contains('flex')) document.body.style.overflow = '';
}

function openMobileMenu() {
    if (!mobileMenu || !mobileMenuBtn) return;
    mobileMenuOpen = true;
    mobileMenu.classList.remove('opacity-0', 'translate-x-full', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'translate-x-0', 'pointer-events-auto');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark', 'rotate-90');
    }
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    document.querySelectorAll('.mobile-link').forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        setTimeout(() => {
            link.style.transition = 'all 0.4s ease';
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        }, 150 + index * 80);
    });
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        if (mobileMenuOpen) closeMobileMenu();
        else openMobileMenu();
    });
}

document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
});

// --- FAQ ---
function setFaqPanelHeight(content, open) {
    if (!content) return;
    if (open) {
        content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
        content.style.maxHeight = null;
    }
}

function refreshOpenFaqPanels() {
    document.querySelectorAll('.faq-btn[aria-expanded="true"]').forEach((button) => {
        setFaqPanelHeight(button.nextElementSibling, true);
    });
}

document.querySelectorAll('.faq-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('.faq-chevron, i');
        if (!content || !icon) return;

        const isOpen = button.getAttribute('aria-expanded') === 'true';

        document.querySelectorAll('.faq-btn').forEach((otherBtn) => {
            if (otherBtn === button) return;
            const otherContent = otherBtn.nextElementSibling;
            const otherIcon = otherBtn.querySelector('.faq-chevron, i');
            setFaqPanelHeight(otherContent, false);
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            otherBtn.setAttribute('aria-expanded', 'false');
        });

        if (isOpen) {
            setFaqPanelHeight(content, false);
            icon.style.transform = 'rotate(0deg)';
            button.setAttribute('aria-expanded', 'false');
        } else {
            setFaqPanelHeight(content, true);
            icon.style.transform = 'rotate(180deg)';
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

window.addEventListener('resize', refreshOpenFaqPanels, { passive: true });

// --- Modal ---
function openModal() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    resetForm();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        modalBackdrop.classList.replace('opacity-0', 'opacity-100');
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
        trapFocus(modal);
        document.getElementById('lead-name')?.focus();
    });
}

function closeModal() {
    if (!modal) return;
    modalBackdrop.classList.replace('opacity-100', 'opacity-0');
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    releaseFocusTrap();
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (!mobileMenuOpen) document.body.style.overflow = '';
        restoreFocus();
    }, 300);
}

function nextStep(stepNumber) {
    clearStepErrors();
    if (stepNumber === 2 && getSelectedSpaces().length === 0) {
        showStepError('error-step-1', 'Selecione ao menos um ambiente para continuar.');
        return;
    }
    if (stepNumber === 3 && !getSelectedUrgency()) {
        showStepError('error-step-2', 'Selecione o momento do seu projeto para continuar.');
        return;
    }
    document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
    document.getElementById(`step-${stepNumber}`)?.classList.remove('hidden');
    updateProgress(stepNumber);
}

function prevStep(stepNumber) {
    clearStepErrors();
    nextStep(stepNumber);
}

function updateProgress(stepNumber) {
    const widths = { 1: '33%', 2: '66%', 3: '100%' };
    const labels = {
        1: 'Etapa 1 · Diagnóstico do Ambiente',
        2: 'Etapa 2 · Momento do Projeto',
        3: 'Etapa 3 · Contato com Consultor',
    };
    document.getElementById('form-progress').style.width = widths[stepNumber] || '33%';
    document.getElementById('step-counter').innerText = labels[stepNumber] || labels[1];
}

function getSelectedSpaces() {
    return [...document.querySelectorAll('input[name="space"]:checked')].map((el) => el.value);
}

function getSelectedUrgency() {
    const selected = document.querySelector('input[name="urgency"]:checked');
    return selected ? selected.value : '';
}

function submitForm() {
    clearFieldErrors();
    clearStepErrors();

    const spaces = getSelectedSpaces();
    const urgency = getSelectedUrgency();
    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const btn = document.getElementById('submit-btn');
    let valid = true;

    if (!spaces.length) {
        showStepError('error-step-1', 'Selecione ao menos um ambiente para continuar.');
        document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
        document.getElementById('step-1')?.classList.remove('hidden');
        updateProgress(1);
        valid = false;
    }
    if (!urgency) {
        showStepError('error-step-2', 'Selecione o momento do seu projeto para continuar.');
        if (spaces.length) {
            document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
            document.getElementById('step-2')?.classList.remove('hidden');
            updateProgress(2);
        }
        valid = false;
    }
    if (!name) {
        showFieldError('lead-name', 'error-name', 'Informe como devemos lhe chamar.');
        valid = false;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        showFieldError('lead-phone', 'error-phone', 'Informe um WhatsApp válido com DDD.');
        valid = false;
    }
    if (!valid) return;

    if (!isWhatsAppConfigured()) {
        showFieldError('lead-phone', 'error-phone', 'WhatsApp do atelier ainda não configurado. Atualize config.js antes do deploy.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando...';
    btn.disabled = true;

    const message = buildLeadMessage(name, phone, spaces, urgency);
    const waUrl = getWhatsAppUrl(message);

    setTimeout(() => {
        document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
        document.getElementById('step-success').classList.remove('hidden');
        document.getElementById('modal-header').classList.add('hidden');
        btn.innerHTML = originalText;
        btn.disabled = false;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 600);
}

function resetForm() {
    clearFieldErrors();
    clearStepErrors();
    document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
    document.getElementById('step-1')?.classList.remove('hidden');
    document.getElementById('modal-header')?.classList.remove('hidden');
    updateProgress(1);
    document.getElementById('lead-name').value = '';
    document.getElementById('lead-phone').value = '';
    document.querySelectorAll('#lead-modal input[type="checkbox"], #lead-modal input[type="radio"]').forEach((input) => {
        input.checked = false;
    });
}

// --- Lightbox ---
function openLightbox(element) {
    const imgEl = element.querySelector('img');
    const titleEl = element.querySelector('[data-title]');
    const subtitleEl = element.querySelector('[data-subtitle]');
    const materialEl = element.querySelector('[data-material]');
    if (!imgEl || !titleEl || !subtitleEl || !materialEl || !lightbox) return;

    lastFocusedElement = document.activeElement;
    const title = titleEl.innerText.trim();
    const subtitle = subtitleEl.innerText.trim();
    const lbImg = document.getElementById('lb-img');

    lbImg.src = imgEl.src;
    lbImg.alt = `${title} — ${subtitle}`;
    document.getElementById('lb-title').innerText = title;
    document.getElementById('lb-subtitle').innerText = subtitle;
    document.querySelector('#lb-material span').innerText = materialEl.getAttribute('data-material') || '';

    const backdrop = document.getElementById('lightbox-backdrop');
    const contentEl = document.getElementById('lb-content');

    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
    if (cursor) cursor.classList.add('opacity-0');

    requestAnimationFrame(() => {
        backdrop.classList.replace('opacity-0', 'opacity-100');
        contentEl.classList.remove('opacity-0', 'scale-95');
        contentEl.classList.add('opacity-100', 'scale-100');
        trapFocus(lightbox);
        lightbox.querySelector('[aria-label="Fechar galeria"]')?.focus();
    });
}

function closeLightbox() {
    if (!lightbox) return;
    const backdrop = document.getElementById('lightbox-backdrop');
    const contentEl = document.getElementById('lb-content');

    backdrop.classList.replace('opacity-100', 'opacity-0');
    contentEl.classList.remove('opacity-100', 'scale-100');
    contentEl.classList.add('opacity-0', 'scale-95');
    releaseFocusTrap();

    setTimeout(() => {
        lightbox.classList.remove('flex');
        lightbox.classList.add('hidden');
        if (!modal.classList.contains('flex')) document.body.style.overflow = '';
        if (cursor && cursorInitialized) cursor.classList.remove('opacity-0');
        restoreFocus();
    }, 400);
}

document.querySelectorAll('.portfolio-item').forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(item);
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (lightbox && !lightbox.classList.contains('hidden')) closeLightbox();
    if (modal?.classList.contains('flex')) closeModal();
    if (mobileMenuOpen) closeMobileMenu();
});

// --- Scroll reveal (sem cards interativos) ---
const revealSelectors = [
    '#solucao h2',
    '#solucao > div > div:first-child p',
    '#depoimentos .text-center h2',
    '#depoimentos .text-center > p',
    '#faq h2',
    '.faq-eyebrow',
    '#faq .text-center > p:last-child',
    '#portfolio h2',
    '#portfolio > div > div:first-child p',
];
revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => el.classList.add('reveal'));
});

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// --- Scroll spotlight (Anatomia + Portfólio) ---
function spotlightHaptic() {
    if (!SPOTLIGHT_CAROUSEL.matches || SPOTLIGHT_MOTION.matches) return;
    if (typeof navigator.vibrate === 'function') navigator.vibrate(12);
}

function spotlightVibrate(el) {
    if (SPOTLIGHT_MOTION.matches) return;
    el.classList.remove('is-vibrating');
    void el.offsetWidth;
    el.classList.add('is-vibrating');
    el.addEventListener('animationend', () => el.classList.remove('is-vibrating'), { once: true });
}

function indexFromTrackCenter(track, items) {
    const trackRect = track.getBoundingClientRect();
    const centerX = trackRect.left + trackRect.width / 2;
    let bestIdx = 0;
    let bestDist = Infinity;

    items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - centerX);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    });

    return bestIdx;
}

function createScrollSpotlight({ section, track, items, dots = [], scrollOnItemTap = false, dotDatasetKey }) {
    if (!section || !track || !items.length) return null;

    let activeIndex = -1;
    let scrollTicking = false;

    function setActive(index, { haptic = false } = {}) {
        if (index < 0 || index >= items.length) return;
        if (index === activeIndex && !haptic) return;

        const changed = index !== activeIndex;
        activeIndex = index;

        items.forEach((item, i) => {
            const lit = i === index;
            item.classList.toggle('is-lit', lit);
            item.classList.toggle('is-glowing', lit && SPOTLIGHT_CAROUSEL.matches);
            if (item.hasAttribute('aria-pressed')) {
                item.setAttribute('aria-pressed', lit ? 'true' : 'false');
            }
            if (lit && changed) spotlightVibrate(item);
        });

        dots.forEach((dot, i) => {
            const active = i === index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
        });

        if (changed && haptic) spotlightHaptic();
    }

    function scrollToIndex(index, behavior = 'smooth') {
        if (!SPOTLIGHT_CAROUSEL.matches) return;
        const item = items[index];
        if (!item) return;
        const trackRect = track.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const offset = itemRect.left - trackRect.left - (trackRect.width - itemRect.width) / 2;
        track.scrollTo({ left: track.scrollLeft + offset, behavior });
        setActive(index, { haptic: true });
    }

    function onTrackScroll() {
        if (!SPOTLIGHT_CAROUSEL.matches) return;
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            setActive(indexFromTrackCenter(track, items), { haptic: true });
            scrollTicking = false;
        });
    }

    track.addEventListener('scroll', onTrackScroll, { passive: true });

    if (scrollOnItemTap) {
        items.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                if (!SPOTLIGHT_CAROUSEL.matches) return;
                e.preventDefault();
                scrollToIndex(i);
            });
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const idx = Number(dot.dataset[dotDatasetKey]);
            scrollToIndex(idx);
        });
    });

    function syncMode() {
        if (SPOTLIGHT_CAROUSEL.matches) {
            setActive(indexFromTrackCenter(track, items), { haptic: false });
        } else {
            items.forEach((item) => {
                item.classList.remove('is-lit', 'is-glowing', 'is-vibrating');
                if (item.hasAttribute('aria-pressed')) item.setAttribute('aria-pressed', 'false');
            });
            dots.forEach((dot) => dot.setAttribute('aria-current', 'false'));
            activeIndex = -1;
        }
    }

    syncMode();
    SPOTLIGHT_CAROUSEL.addEventListener('change', syncMode);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && SPOTLIGHT_CAROUSEL.matches && activeIndex < 0) {
                setActive(indexFromTrackCenter(track, items), { haptic: false });
            }
        });
    }, { threshold: 0.2 });
    sectionObserver.observe(section);

    return { scrollToIndex, setActive };
}

function syncAnatomyCardA11y(cards) {
    const carouselMode = SPOTLIGHT_CAROUSEL.matches;
    cards.forEach((card) => {
        if (carouselMode) {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-pressed', card.classList.contains('is-lit') ? 'true' : 'false');
        } else {
            card.removeAttribute('role');
            card.removeAttribute('tabindex');
            card.removeAttribute('aria-pressed');
        }
    });
}

function initAnatomySpotlight() {
    const section = document.getElementById('diferenciais');
    const cards = section ? [...section.querySelectorAll('.anatomy-card')] : [];

    const spotlight = createScrollSpotlight({
        section,
        track: section?.querySelector('.anatomy-track'),
        items: cards,
        dots: section ? [...section.querySelectorAll('.anatomy-dot')] : [],
        scrollOnItemTap: true,
        dotDatasetKey: 'anatomyDot',
    });

    if (!spotlight) return;

    syncAnatomyCardA11y(cards);
    SPOTLIGHT_CAROUSEL.addEventListener('change', () => syncAnatomyCardA11y(cards));

    cards.forEach((card, i) => {
        card.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (!SPOTLIGHT_CAROUSEL.matches) return;
            e.preventDefault();
            spotlight.scrollToIndex(i);
        });
    });
}

function initPortfolioSpotlight() {
    createScrollSpotlight({
        section: document.getElementById('portfolio'),
        track: document.querySelector('.portfolio-track'),
        items: [...document.querySelectorAll('.portfolio-item')],
        dots: [...document.querySelectorAll('.portfolio-dot')],
        scrollOnItemTap: false,
        dotDatasetKey: 'portfolioDot',
    });
}

// --- Magnetic buttons (sem conflitar com :active) ---
if (isFinePointer() && !REDUCED_MOTION.matches) {
    document.querySelectorAll('button.bg-contrast, button.bg-accent, .magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            if (btn.disabled) return;
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left) - rect.width / 2;
            const y = (e.clientY - rect.top) - rect.height / 2;
            btn.style.setProperty('--magnetic-x', `${x * 0.18}px`);
            btn.style.setProperty('--magnetic-y', `${y * 0.18}px`);
            btn.classList.add('is-magnetic');
        });
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('is-magnetic');
            btn.style.removeProperty('--magnetic-x');
            btn.style.removeProperty('--magnetic-y');
        });
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof hydrateSiteImages === 'function') hydrateSiteImages();
    hydrateContactLinks();
    hydrateSeoMeta();
    initAnatomySpotlight();
    initPortfolioSpotlight();

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (!isWhatsAppConfigured() && window.location.hostname === 'localhost') {
        console.warn('[Sartoria] Configure SITE_CONFIG.whatsapp em config.js antes do deploy.');
    }
});

// Expor para onclick inline
window.openModal = openModal;
window.closeModal = closeModal;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.submitForm = submitForm;
window.closeMobileMenu = closeMobileMenu;
