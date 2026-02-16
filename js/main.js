/**
 * IT NORD - Main Site Script
 * Loads dynamic content from admin-managed localStorage
 * Includes: Language switcher, Live chat, Communication buttons, Our Work dropdown
 */

const TRANSLATIONS = {
    ar: {
        ourWork: 'اعمالنا',
        homePage: 'الصفحة الرئيسية',
        featuredServices: 'خدماتنا المميزة',
        antennas: 'الهوائيات والاتصال',
        networkServices: 'خدمات الشبكات',
        businessSummary: 'ملخص الأعمال',
        ourTools: 'أدواتنا وتقنياتنا',
        integratedSolutions: 'الحلول المتكاملة',
        liveChat: 'الدردشة المباشرة',
        chatWelcome: 'مرحباً! كيف يمكننا مساعدتك؟',
        chatPlaceholder: 'اكتب رسالتك...',
        sectionTitleTools: 'أدواتنا وتقنياتنا',
        digitalImagination: 'الخيال الرقمي',
        contactUs: 'تواصل معنا'
    },
    en: {
        ourWork: 'Our Work',
        homePage: 'Home',
        featuredServices: 'Featured Services',
        antennas: 'Antennas & Connectivity',
        networkServices: 'Network Services',
        businessSummary: 'Business Summary',
        ourTools: 'Our Tools & Technologies',
        integratedSolutions: 'Integrated Solutions',
        liveChat: 'Live Chat',
        chatWelcome: 'Hello! How can we help you?',
        chatPlaceholder: 'Type your message...',
        sectionTitleTools: 'Our Tools & Technologies',
        digitalImagination: 'Digital Imagination',
        contactUs: 'Contact Us'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    loadFeatures();
    loadTools();
    loadMediaOverrides();
    initOurWorkDropdown();
    initContactButton();
    initChat();
    initDimCarousel();
});

function initDimCarousel() {
    const track = document.getElementById('dim-carousel-track');
    if (!track) return;
    const slides = track.querySelectorAll('.dim-slide-card');
    if (slides.length === 0) return;

    let currentIndex = 0;
    const INTERVAL_MS = 5000;

    function goToSlide(index) {
        slides.forEach((s, i) => s.classList.toggle('active', i === index));
        currentIndex = index;
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % slides.length);
    }

    let intervalId = setInterval(nextSlide, INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(intervalId);
        } else {
            intervalId = setInterval(nextSlide, INTERVAL_MS);
        }
    });
}

function initContactButton() {
    const btn = document.getElementById('nav-contact-btn');
    const panel = document.getElementById('nav-contact-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('hidden');
    });
    document.addEventListener('click', () => panel.classList.add('hidden'));
}

function getCurrentLang() {
    return localStorage.getItem('itnord_lang') || 'ar';
}

function setCurrentLang(lang) {
    localStorage.setItem('itnord_lang', lang);
}

function initLanguage() {
    const lang = getCurrentLang();
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    applyTranslations(lang);

    const switcher = document.getElementById('lang-switcher');
    const label = switcher?.querySelector('.lang-label');
    if (switcher && label) {
        label.textContent = lang === 'ar' ? 'EN' : 'العربية';
        switcher.onclick = () => {
            const newLang = lang === 'ar' ? 'en' : 'ar';
            setCurrentLang(newLang);
            location.reload();
        };
    }
}

function applyTranslations(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    document.querySelectorAll('.hero-slogan.en').forEach(el => el.style.display = lang === 'en' ? 'block' : 'none');
    document.querySelectorAll('.hero-slogan.ar').forEach(el => el.style.display = lang === 'ar' ? 'block' : 'none');
}

function getStoredData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem('itnord_' + key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function loadFeatures() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;

    const features = getStoredData('features', getDefaultFeatures());
    grid.innerHTML = features.map(f => {
        const isVideo = f.url && (f.url.includes('.mp4') || f.url.includes('.webm'));
        return `
            <div class="feature-card">
                ${isVideo 
                    ? `<video src="${f.url}" loop muted playsinline autoplay></video>`
                    : `<img src="${f.url}" alt="${f.title || ''}">`
                }
                <div class="feature-text">${f.title || ''}</div>
            </div>
        `;
    }).join('');
}

function getDefaultFeatures() {
    return [
        { url: 'assets/1-ptz-camera.png', title: 'كاميرات المراقبة والأمان' },
        { url: 'assets/8-antenna.png', title: 'هوائيات محسنة لتجربة إنترنت استثنائية' },
        { url: 'assets/5-iot-smart-home.png', title: 'المباني الذكية وإنترنت الأشياء' }
    ];
}

function loadTools() {
    const grid = document.getElementById('tools-grid');
    const titleEl = document.querySelector('#tools-section .section-title');
    if (!grid) return;

    const lang = getCurrentLang();
    if (titleEl && TRANSLATIONS[lang]?.sectionTitleTools) {
        titleEl.textContent = TRANSLATIONS[lang].sectionTitleTools;
    }

    const tools = getStoredData('tools', getDefaultTools());
    if (tools.length === 0) {
        grid.innerHTML = '<p style="color: var(--gray-500);">لا توجد أدوات مضافة حالياً.</p>';
        return;
    }
    grid.innerHTML = tools.map(t => `
        <div class="tool-item">
            ${t.icon ? `<span>${t.icon}</span>` : ''}
            ${t.label || t.name || 'أداة'}
        </div>
    `).join('');
}

function getDefaultTools() {
    return [
        { label: 'شبكات الإنترنت', icon: '📶' },
        { label: 'هوائيات محسنة', icon: '📡' },
        { label: 'أنظمة الأمان', icon: '🔒' },
        { label: 'المباني الذكية', icon: '🏠' }
    ];
}

function loadMediaOverrides() {
    const overrides = getStoredData('media_overrides', {});
    Object.entries(overrides).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el && url) el.src = url;
    });
}

function getDefaultCommunicationButtons() {
    return [
        { type: 'phone', href: 'tel:+22247774141', label: 'اتصل', title: '0022247774141' },
        { type: 'whatsapp', href: 'https://wa.me/22247774141', label: 'واتساب', title: '0022247774141', target: '_blank' },
        { type: 'email', href: 'mailto:Itnord@outlook.fr', label: 'بريد', title: 'البريد الإلكتروني' },
        { type: 'location', href: '#', label: 'الموقع', title: 'الموقع' }
    ];
}

function loadCommunicationButtons() {
    const panel = document.getElementById('communication-panel');
    if (!panel) return;

    const config = getStoredData('comm_buttons', { buttons: getDefaultCommunicationButtons(), position: 'left', vertical: 'bottom' });
    const buttons = config.buttons || getDefaultCommunicationButtons();
    const position = config.position || 'left';
    const vertical = config.vertical || 'bottom';

    panel.className = 'communication-panel';
    if (position === 'right') panel.classList.add('comm-panel-right');
    if (vertical === 'top') panel.classList.add('comm-panel-top');

    const icons = {
        phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    };

    panel.innerHTML = buttons.map(b => {
        const icon = icons[b.type] || '';
        const targetAttr = b.target ? ` target="${b.target}"` : '';
        return `
            <a href="${b.href || '#'}" class="comm-btn ${b.type}" title="${b.title || b.label}"${targetAttr}>
                ${icon}
                <span>${b.label || ''}</span>
            </a>
        `;
    }).join('');
}

function initOurWorkDropdown() {
    const dropdown = document.getElementById('our-work-dropdown');
    const menu = document.getElementById('our-work-menu');
    if (!dropdown || !menu) return;

    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        menu.classList.remove('open');
        dropdown.classList.remove('open');
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            dropdown.classList.remove('open');
        });
    });
}

function initChat() {
    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const close = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            document.querySelector('.chat-badge')?.classList.add('hidden');
        }
    });

    close?.addEventListener('click', () => panel.classList.add('hidden'));

    function addMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = 'chat-msg ' + (isUser ? 'sent' : 'received');
        div.innerHTML = `<p>${text}</p>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    const responses = [
        'شكراً لتواصلكم! فريقنا سيرد عليكم قريباً.',
        'هل تحتاجون مزيداً من المعلومات؟ تواصلوا معنا على الهاتف أو واتساب.'
    ];

    send?.addEventListener('click', () => {
        const text = input?.value?.trim();
        if (!text) return;
        addMessage(text, true);
        input.value = '';
        setTimeout(() => addMessage(responses[Math.floor(Math.random() * responses.length)]), 800);
    });

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') send?.click();
    });
}
