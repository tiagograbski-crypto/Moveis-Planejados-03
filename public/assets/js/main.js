'use strict';

const cursor = document.getElementById('custom-cursor');
const cursorText = document.getElementById('cursor-text');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const actionBar = document.getElementById('mobile-action-bar');
const modal = document.getElementById('lead-modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalContent = document.getElementById('modal-content');

let cursorInitialized = false;
let lastScrollTop = 0;
let mobileMenuOpen = false;

function isFinePointer() {
    return window.matchMedia('(pointer: fine)').matches;
}

function hydrateContactLinks() {
    const waFloat = document.getElementById('whatsapp-float');
    if (waFloat) waFloat.href = getWhatsAppUrl();

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
        addressEl.innerHTML = `${SITE_CONFIG.address.line1}<br>${SITE_CONFIG.address.city}`;
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
    document.getElementById('progress-bar').style.width = `${(winScroll / Math.max(height, 1)) * 100}%`;

    document.getElementById('header').classList.toggle('shadow-glass', winScroll > 50);

    if (!actionBar) return;
    if (winScroll > lastScrollTop && winScroll > 100) {
        actionBar.style.transform = 'translateY(100%)';
    } else {
        actionBar.style.transform = 'translateY(0)';
    }
    lastScrollTop = winScroll <= 0 ? 0 : winScroll;
}, { passive: true });

// --- Custom cursor ---
if (isFinePointer() && cursor) {
    document.addEventListener('mousemove', (e) => {
        if (!cursorInitialized) {
            document.body.classList.add('has-custom-cursor');
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
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    mobileMenu.classList.remove('opacity-100', 'translate-x-0', 'pointer-events-auto');
    mobileMenu.classList.add('opacity-0', 'translate-x-full', 'pointer-events-none');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-xmark', 'rotate-90');
    icon.classList.add('fa-bars');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    if (!modal.classList.contains('flex')) document.body.style.overflow = '';
}

function openMobileMenu() {
    mobileMenuOpen = true;
    mobileMenu.classList.remove('opacity-0', 'translate-x-full', 'pointer-events-none');
    mobileMenu.classList.add('opacity-100', 'translate-x-0', 'pointer-events-auto');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-xmark', 'rotate-90');
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

mobileMenuBtn.addEventListener('click', () => {
    if (mobileMenuOpen) closeMobileMenu();
    else openMobileMenu();
});

document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
});

// --- FAQ ---
document.querySelectorAll('.faq-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const content = button.nextElementSibling;
        const icon = button.querySelector('i');
        const isOpen = Boolean(content.style.maxHeight);

        document.querySelectorAll('.accordion-content').forEach((el) => {
            if (el !== content) {
                el.style.maxHeight = null;
                el.previousElementSibling.querySelector('i').style.transform = 'rotate(0deg)';
                el.previousElementSibling.setAttribute('aria-expanded', 'false');
            }
        });

        if (isOpen) {
            content.style.maxHeight = null;
            icon.style.transform = 'rotate(0deg)';
            button.setAttribute('aria-expanded', 'false');
        } else {
            content.style.maxHeight = `${content.scrollHeight}px`;
            icon.style.transform = 'rotate(180deg)';
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

// --- Modal ---
function openModal() {
    resetForm();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        modalBackdrop.classList.replace('opacity-0', 'opacity-100');
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    });
    document.getElementById('lead-name').focus();
}

function closeModal() {
    modalBackdrop.classList.replace('opacity-100', 'opacity-0');
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (!mobileMenuOpen) document.body.style.overflow = '';
    }, 300);
}

function nextStep(stepNumber) {
    document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
    document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
    updateProgress(stepNumber);
}

function prevStep(stepNumber) {
    nextStep(stepNumber);
}

function updateProgress(stepNumber) {
    const widths = { 1: '33%', 2: '66%', 3: '100%' };
    document.getElementById('form-progress').style.width = widths[stepNumber] || '33%';
    document.getElementById('step-counter').innerText = `Passo ${stepNumber} de 3`;
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
    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const btn = document.getElementById('submit-btn');
    let valid = true;

    if (!name) {
        showFieldError('lead-name', 'error-name', 'Informe como devemos lhe chamar.');
        valid = false;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        showFieldError('lead-phone', 'error-phone', 'Informe um WhatsApp válido com DDD.');
        valid = false;
    }
    if (!valid) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processando...';
    btn.disabled = true;

    const message = buildLeadMessage(name, phone, getSelectedSpaces(), getSelectedUrgency());
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
    document.querySelectorAll('.form-step').forEach((el) => el.classList.add('hidden'));
    document.getElementById('step-1').classList.remove('hidden');
    document.getElementById('modal-header').classList.remove('hidden');
    updateProgress(1);
    document.getElementById('lead-name').value = '';
    document.getElementById('lead-phone').value = '';
    document.querySelectorAll('#lead-modal input[type="checkbox"], #lead-modal input[type="radio"]').forEach((input) => {
        input.checked = false;
    });
}

// --- Lightbox ---
function openLightbox(element) {
    document.getElementById('lb-img').src = element.querySelector('img').src;
    document.getElementById('lb-title').innerText = element.querySelector('[data-title]').innerText;
    document.getElementById('lb-subtitle').innerText = element.querySelector('[data-subtitle]').innerText;
    document.querySelector('#lb-material span').innerText = element.querySelector('[data-material]').getAttribute('data-material');

    const lightbox = document.getElementById('portfolio-lightbox');
    const backdrop = document.getElementById('lightbox-backdrop');
    const contentEl = document.getElementById('lb-content');

    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
    document.body.classList.remove('has-custom-cursor');
    if (cursor) cursor.classList.add('hidden');

    requestAnimationFrame(() => {
        backdrop.classList.replace('opacity-0', 'opacity-100');
        contentEl.classList.remove('opacity-0', 'scale-95');
        contentEl.classList.add('opacity-100', 'scale-100');
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('portfolio-lightbox');
    const backdrop = document.getElementById('lightbox-backdrop');
    const contentEl = document.getElementById('lb-content');

    backdrop.classList.replace('opacity-100', 'opacity-0');
    contentEl.classList.remove('opacity-100', 'scale-100');
    contentEl.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        lightbox.classList.remove('flex');
        lightbox.classList.add('hidden');
        if (!modal.classList.contains('flex')) document.body.style.overflow = '';
    }, 400);

    if (cursorInitialized && isFinePointer() && cursor) {
        document.body.classList.add('has-custom-cursor');
        cursor.classList.remove('hidden');
    }
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
    if (!document.getElementById('portfolio-lightbox').classList.contains('hidden')) closeLightbox();
    if (modal.classList.contains('flex')) closeModal();
    if (mobileMenuOpen) closeMobileMenu();
});

// --- Scroll reveal ---
document.querySelectorAll('section h2, section p, .xray-container, .portfolio-item').forEach((el) => {
    el.classList.add('reveal');
});

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// --- Magnetic buttons ---
if (isFinePointer()) {
    document.querySelectorAll('button.bg-contrast, button.bg-accent, .magnetic-btn').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left) - rect.width / 2;
            const y = (e.clientY - rect.top) - rect.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    hydrateContactLinks();
    document.getElementById('year').textContent = new Date().getFullYear();
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
