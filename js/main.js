(function () {
    'use strict';

    const CONFIG = {
        whatsapp: "5591998116629",
        instagram: "@brunofabricio.imoveis",
        email: "gerencia.bruno0@gmail.com",
        analyticsId: ""
    };

    const WHATSAPP_BASE = 'https://wa.me/';
    let lastFocusedElement = null;

    function buildWhatsAppUrl(message) {
        const encoded = encodeURIComponent(message || 'Olá, Bruno!');
        return WHATSAPP_BASE + CONFIG.whatsapp + '?text=' + encoded;
    }

    function openWhatsApp(message, source) {
        const url = buildWhatsAppUrl(message);
        trackWhatsAppClick(source || 'generic', message);
        window.open(url, '_blank', 'noopener,noreferrer');
        return url;
    }

    function trackCTA(location, label) {
        try {
            if (typeof window.gtag === 'function' && CONFIG.analyticsId) {
                window.gtag('event', 'cta_click', {
                    event_category: 'engagement',
                    event_label: label || location,
                    event_location: location
                });
            }
            if (typeof window.fbq === 'function') {
                window.fbq('trackCustom', 'CTAClick', { location: location, label: label });
            }
        } catch (e) {}
    }

    function trackWhatsAppClick(source, message) {
        try {
            trackCTA(source || 'whatsapp', message);
            if (typeof window.gtag === 'function' && CONFIG.analyticsId) {
                window.gtag('event', 'whatsapp_click', {
                    event_category: 'conversion',
                    event_label: source,
                    value: 1
                });
            }
        } catch (e) {}
    }

    function trackFormSubmit(data) {
        try {
            if (typeof window.gtag === 'function' && CONFIG.analyticsId) {
                window.gtag('event', 'form_submit', {
                    event_category: 'lead',
                    event_label: 'AnaliseImovel',
                    value: 1,
                    tipo_imovel: data.tipoImovel,
                    finalidade: data.finalidade
                });
            }
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'Lead', { content_name: 'AnaliseImovel' });
            }
        } catch (e) {}
    }

    function trackExclusiveInterest() {
        try {
            if (typeof window.gtag === 'function' && CONFIG.analyticsId) {
                window.gtag('event', 'exclusive_interest', {
                    event_category: 'conversion',
                    event_label: 'TrabalhoEmExclusividade',
                    value: 1
                });
            }
        } catch (e) {}
    }

    function showToast(message, duration) {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toast-text');
        if (!toast) return;

        if (toastText && message) {
            toastText.textContent = message;
        }

        toast.hidden = false;
        requestAnimationFrame(function () {
            toast.classList.add('is-visible');
        });

        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            toast.classList.remove('is-visible');
            setTimeout(function () {
                toast.hidden = true;
            }, 400);
        }, duration || 4200);
    }

    function handleWhatsAppCTAs() {
        const ctas = document.querySelectorAll('[data-whatsapp]');
        ctas.forEach(function (cta) {
            cta.addEventListener('click', function (e) {
                e.preventDefault();
                const message = cta.getAttribute('data-message') || 'Olá, Bruno!';
                const source = cta.getAttribute('data-whatsapp');
                const isExclusive = cta.getAttribute('data-exclusive') === 'true';

                trackCTA(source);
                if (isExclusive) {
                    trackExclusiveInterest();
                }
                openWhatsApp(message, source);
            });
        });

        const floatBtn = document.getElementById('whatsapp-float');
        if (floatBtn) {
            floatBtn.addEventListener('click', function (e) {
                e.preventDefault();
                openWhatsApp('Olá, Bruno! Gostaria de conversar sobre meu imóvel.', 'floating-button');
            });
        }
    }

    function handleHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        let ticking = false;

        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.scrollY > 40) {
                        header.classList.add('is-scrolled');
                    } else {
                        header.classList.remove('is-scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function handleMobileMenu() {
        const hamburger = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeBtn = document.getElementById('mobile-close-btn');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        const mobileCta = document.querySelector('.mobile-cta');
        const body = document.body;

        if (!hamburger || !mobileMenu) return;

        function openMenu() {
            lastFocusedElement = document.activeElement;
            mobileMenu.hidden = false;
            hamburger.classList.add('is-open');
            hamburger.setAttribute('aria-expanded', 'true');
            body.style.overflow = 'hidden';
            if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 100);
        }

        function closeMenu() {
            mobileMenu.hidden = true;
            hamburger.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        hamburger.addEventListener('click', function () {
            if (mobileMenu.hidden) openMenu();
            else closeMenu();
        });

        if (closeBtn) closeBtn.addEventListener('click', closeMenu);

        mobileLinks.forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        if (mobileCta) mobileCta.addEventListener('click', closeMenu);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !mobileMenu.hidden) {
                closeMenu();
            }
        });

        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) closeMenu();
        });
    }

    function setupScrollReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window) || items.length === 0) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        items.forEach(function (el) {
            observer.observe(el);
        });
    }

    function setupTimelineProgress() {
        const timeline = document.querySelector('.timeline');
        const progressEl = document.getElementById('timeline-progress');
        const items = document.querySelectorAll('.timeline__item');
        if (!timeline || !progressEl) return;

        if (!('IntersectionObserver' in window)) {
            progressEl.style.height = '100%';
            items.forEach(function (i) { i.classList.add('is-visible'); });
            return;
        }

        const itemObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.25 });
        items.forEach(function (i) { itemObserver.observe(i); });

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    const rect = timeline.getBoundingClientRect();
                    const vh = window.innerHeight;
                    const startPoint = rect.top + vh * 0.2;
                    const endPoint = rect.bottom - vh * 0.15;
                    const total = endPoint - startPoint;
                    const current = Math.min(Math.max(vh - startPoint, 0), total);
                    let pct = total > 0 ? (current / total) * 100 : 0;
                    if (pct < 0) pct = 0;
                    if (pct > 100) pct = 100;
                    progressEl.style.height = pct + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        onScroll();
    }

    function applyPhoneMask(input) {
        if (!input) return;
        input.addEventListener('input', function () {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            let formatted = '';
            if (value.length > 0) formatted = '(' + value.slice(0, 2);
            if (value.length > 2) formatted += ') ' + value.slice(2, 7);
            if (value.length > 7) formatted += '-' + value.slice(7);
            input.value = formatted;
        });
    }

    function setupFormValidation() {
        const form = document.getElementById('lead-form');
        if (!form) return;

        const phoneInput = document.getElementById('whatsapp-input');
        applyPhoneMask(phoneInput);

        const fields = [
            { id: 'nome', name: 'nome', label: 'Nome', required: true, min: 2 },
            { id: 'whatsapp-input', name: 'whatsapp', label: 'WhatsApp', required: true, type: 'phone' },
            { id: 'tipo-imovel', name: 'tipoImovel', label: 'Tipo de imóvel', required: true },
            { id: 'localizacao', name: 'localizacao', label: 'Cidade / Bairro', required: true, min: 3 },
            { id: 'finalidade', name: 'finalidade', label: 'Finalidade', required: true }
        ];

        function setFieldError(fieldId, message) {
            const input = document.getElementById(fieldId);
            const errorEl = document.getElementById(fieldId + '-error');
            const group = input ? input.closest('.form-group') : null;
            if (group) {
                if (message) {
                    group.classList.add('has-error');
                    input.setAttribute('aria-invalid', 'true');
                } else {
                    group.classList.remove('has-error');
                    input.removeAttribute('aria-invalid');
                }
            }
            if (errorEl) errorEl.textContent = message || '';
            return !message;
        }

        function validateField(fieldCfg) {
            const input = document.getElementById(fieldCfg.id);
            if (!input) return true;
            const value = (input.value || '').trim();

            if (fieldCfg.required && !value) {
                return setFieldError(fieldCfg.id, 'Campo obrigatório.');
            }

            if (fieldCfg.min && value.length < fieldCfg.min) {
                return setFieldError(fieldCfg.id, 'Informe pelo menos ' + fieldCfg.min + ' caracteres.');
            }

            if (fieldCfg.type === 'phone') {
                const digits = value.replace(/\D/g, '');
                if (digits.length < 10) {
                    return setFieldError(fieldCfg.id, 'Informe um número de WhatsApp válido.');
                }
            }

            setFieldError(fieldCfg.id, '');
            return true;
        }

        fields.forEach(function (cfg) {
            const input = document.getElementById(cfg.id);
            if (!input) return;
            input.addEventListener('blur', function () { validateField(cfg); });
            input.addEventListener('change', function () { validateField(cfg); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;
            fields.forEach(function (cfg) {
                if (!validateField(cfg)) isValid = false;
            });

            if (!isValid) {
                const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
                if (firstError) firstError.focus();
                return;
            }

            const data = {
                nome: document.getElementById('nome').value.trim(),
                whatsapp: document.getElementById('whatsapp-input').value.trim(),
                tipoImovel: document.getElementById('tipo-imovel').value,
                localizacao: document.getElementById('localizacao').value.trim(),
                finalidade: document.getElementById('finalidade').value,
                descricao: (document.getElementById('descricao').value || '').trim()
            };

            const lines = [
                'Olá, Bruno! Gostaria de solicitar uma análise do meu imóvel.',
                '',
                '📋 DADOS PARA ANÁLISE:',
                '',
                'Nome: ' + data.nome,
                'WhatsApp: ' + data.whatsapp,
                'Tipo de imóvel: ' + data.tipoImovel,
                'Localização: ' + data.localizacao,
                'Finalidade: ' + data.finalidade
            ];

            if (data.descricao) {
                lines.push('Descrição: ' + data.descricao);
            }

            const message = lines.join('\n');

            trackFormSubmit(data);

            showToast('Sua mensagem está pronta. O WhatsApp será aberto em instantes...', 4500);

            setTimeout(function () {
                openWhatsApp(message, 'lead-form');
            }, 500);
        });
    }

    function setupSmoothScrollLinks() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const headerHeight = document.getElementById('header') ? document.getElementById('header').offsetHeight : 0;
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight + 1;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            });
        });
    }

    function init() {
        handleWhatsAppCTAs();
        handleHeaderScroll();
        handleMobileMenu();
        setupScrollReveal();
        setupTimelineProgress();
        setupFormValidation();
        setupSmoothScrollLinks();

        document.documentElement.classList.add('js-ready');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
