/**
 * IT NORD - Main Site Script
 * Loads dynamic content from admin-managed localStorage
 * Includes: Language switcher, Live chat, Communication buttons, Our Work dropdown
 */

const API = (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) ? window.location.origin + '/api' : '';

const TRANSLATIONS = {
    ar: {
        ourWork: 'اعمالنا',
        ourProjects: 'مشاريعنا التعليمية',
        projectsSubtitle: 'تصميم التطبيقات، إنشاء السيرفرات، وإنشاء المواقع — نصوص وفيديوهات تعليمية',
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
        contactUs: 'تواصل معنا',
        serverCreation: 'إنشاء السيرفرات',
        camerasSecurity: 'كاميرات المراقبة والأمان',
        smartBuildings: 'المباني الذكية',
        backToHome: 'العودة للرئيسية',
        contact: 'اتصل',
        dishHeading: 'سنوات من الخبرة في مد جسور الاتصال',
        dishSubtitle: 'هوائيات محسنة لتجربة إنترنت استثنائية',
        dishDesc: 'تقنية متقدمة، اتصال مضمون',
        playVideo: 'تشغيل الفيديو'
    },
    en: {
        ourWork: 'Our Work',
        ourProjects: 'Our Educational Projects',
        projectsSubtitle: 'App design, server creation, website creation — texts and videos',
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
        contactUs: 'Contact Us',
        serverCreation: 'Server Creation',
        camerasSecurity: 'Surveillance & Security',
        smartBuildings: 'Smart Buildings',
        backToHome: 'Back to Home',
        contact: 'Contact',
        dishHeading: 'Years of experience bridging connectivity',
        dishSubtitle: 'Enhanced antennas for an exceptional internet experience',
        dishDesc: 'Advanced technology, guaranteed connection',
        playVideo: 'Play Video'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initOurWorkLinks();
    loadFeatures();
    loadTools();
    loadMediaOverrides();
    loadProjects();
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

function initOurWorkLinks() {
    const onServer = (window.location.protocol === 'http:' || window.location.protocol === 'https:');
    document.querySelectorAll('.our-work-link[data-project]').forEach(a => {
        const pid = a.dataset.project;
        if (onServer && pid) a.href = '/project/' + pid;
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

async function loadFeatures() {
    const grid = document.getElementById('features-grid');
    if (!grid) return;
    let features = getStoredData('features', null);
    if (API) {
        try {
            const res = await fetch(API + '/features');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) features = data;
            }
        } catch (_) {}
    }
    if (!features || features.length === 0) features = getDefaultFeatures();
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

async function loadTools() {
    const grid = document.getElementById('tools-grid');
    const titleEl = document.querySelector('#tools-section .section-title');
    if (!grid) return;

    const lang = getCurrentLang();
    if (titleEl && TRANSLATIONS[lang]?.sectionTitleTools) {
        titleEl.textContent = TRANSLATIONS[lang].sectionTitleTools;
    }

    let tools = getStoredData('tools', null);
    if (API) {
        try {
            const res = await fetch(API + '/tools');
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) tools = data;
            }
        } catch (_) {}
    }
    if (!tools || tools.length === 0) tools = getDefaultTools();
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

async function loadMediaOverrides() {
    let overrides = getStoredData('media_overrides', {});
    if (API) {
        try {
            const res = await fetch(API + '/media');
            if (res.ok) {
                const data = await res.json();
                if (data && Object.keys(data).length > 0) overrides = data;
            }
        } catch (_) {}
    }
    Object.entries(overrides).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el && url) el.src = url;
    });
}

async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    try {
        if (API) {
            const res = await fetch(API + '/projects');
            if (res.ok) {
                const projects = await res.json();
                const lang = getCurrentLang();
                const base = window.location.origin || '';
                if (projects.length === 0) {
                    grid.innerHTML = '<p style="color: var(--gray-300); text-align:center;">لا توجد مشاريع حالياً.</p>';
                    return;
                }
                grid.innerHTML = projects.map(p => {
                    const title = lang === 'ar' ? (p.title_ar || p.title_en) : (p.title_en || p.title_ar);
                    const desc = lang === 'ar' ? (p.description_ar || p.description_en) : (p.description_en || p.description_ar);
                    const shortDesc = (desc || '').slice(0, 100) + ((desc || '').length > 100 ? '...' : '');
                    const thumb = p.thumbnail_url || 'assets/6-digital-interface.png';
                    const href = base ? base + '/project/' + p.id : 'project.html?id=' + p.id;
                    return `
                        <a href="${href}" class="project-card">
                            <div class="project-card-thumb">
                                <img src="${thumb}" alt="${title}">
                            </div>
                            <div class="project-card-body">
                                <h3>${title}</h3>
                                <p>${shortDesc}</p>
                            </div>
                        </a>
                    `;
                }).join('');
                return;
            }
        }
    } catch (_) {}
    grid.innerHTML = '<p style="color: var(--gray-300); text-align:center;">قم بتشغيل خادم Python لعرض المشاريع.</p>';
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

    const lang = getCurrentLang();
    send?.addEventListener('click', () => {
        const text = input?.value?.trim();
        if (!text) return;
        addMessage(text, true);
        input.value = '';
        setTimeout(() => addMessage(getChatResponse(text, lang)), 600);
    });

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') send?.click();
    });
}

/**
 * Chat auto-response: matches company services/offers and responds accordingly.
 * Responds to existing and non-existing requests with relevant info.
 */
function getChatResponse(userText, siteLang) {
    const q = (userText || '').replace(/\s+/g, ' ').trim();
    if (!q) return siteLang === 'ar' ? 'كيف يمكنني مساعدتك؟' : 'How can I help you?';
    const qLower = q.toLowerCase();
    const hasArabic = /[\u0600-\u06FF]/.test(q);
    const lang = hasArabic ? 'ar' : (siteLang || 'ar');

    const KB = {
        ar: [
            { keys: ['هوائي', 'هوائيات', 'انترنت', 'إشارة', 'واي فاي', 'وايفاي', 'شبكة', 'شبكات'], msg: 'نقدم هوائيات محسنة وتغطية واي فاي شاملة. الجسور اللاسلكية لربط المواقع. تواصلوا: 0022247774141 أو واتساب.' },
            { keys: ['سيرفر', 'سيرفرات', 'خادم', 'خوادم', 'استضافة', 'hosting'], msg: 'نبني غرف السيرفرات، نثبت الأنظمة، ونضبط الأمان والاستضافة. تصفح "مشاريعنا التعليمية" للفيديوهات.' },
            { keys: ['موقع', 'مواقع', 'ويب', 'web', 'تطبيق', 'تطبيقات'], msg: 'نصمم تطبيقات ويب وجوال احترافية. واجهات المستخدم، تجربة المستخدم، وإنشاء المواقع. شاهد الفيديوهات في قسم المشاريع.' },
            { keys: ['كاميرا', 'مراقبة', 'أمان', 'امن'], msg: 'أنظمة مراقبة وأمان متقدمة. كاميرات PTZ وقبة. مراقبة عن بعد 24/7.' },
            { keys: ['ذكي', 'منزل ذكي', 'smart', 'إنترنت الأشياء', 'iot'], msg: 'المباني الذكية وإنترنت الأشياء. أتمتة المنازل وتكامل الأجهزة.' },
            { keys: ['تيار خفيف', 'بنية تحتية', 'كابلات'], msg: 'حلول التيار الخفيف والاتصالات. تجهيز البنية التحتية الرقمية.' },
            { keys: ['سعر', 'تكلفة', 'ثمن', 'كم', 'كم يكلف'], msg: 'للمعرفة الدقيقة بالأسعار والتفاصيل، تواصلوا معنا: هاتف 0022247774141 أو واتساب أو البريد Itnord@outlook.fr' },
            { keys: ['تواصل', 'اتصل', 'رقم', 'هاتف', 'بريد', 'واتساب', 'contact'], msg: 'هاتف: 0022247774141 | واتساب: 0022247774141 | البريد: Itnord@outlook.fr' },
            { keys: ['خدمات', 'اعمال', 'ماذا تقدم', 'ماذا تقدمون', 'عروض'], msg: 'نقدم: 1) شبكات وإنترنت وواي فاي وهوائيات 2) التيار الخفيف والمباني الذكية والمراقبة 3) غرف السيرفرات والاستشارات الهندسية. شعارنا: في العالم الفني نصنع المستحيل.' },
            { keys: ['مرحبا', 'السلام', 'اهلا', 'hello', 'hi', 'هاي'], msg: 'أهلاً! كيف يمكننا مساعدتك؟ اسأل عن خدماتنا، الأسعار، أو التواصل.' },
            { keys: ['استشارة', 'استشارات', 'فني'], msg: 'نقدم استشارات فنية متكاملة تلائم مشاريعكم. تواصلوا: 0022247774141 أو Itnord@outlook.fr' },
            { keys: ['فيديو', 'فيديوهات', 'تعليمي', 'تعلم'], msg: 'لدينا فيديوهات تعليمية في قسم "مشاريعنا التعليمية": تصميم التطبيقات، إنشاء السيرفرات، وإنشاء المواقع.' }
        ],
        en: [
            { keys: ['antenna', 'wifi', 'network', 'internet'], msg: 'We provide enhanced antennas and full Wi-Fi coverage. Wireless bridges for site connectivity. Contact: 0022247774141 or WhatsApp.' },
            { keys: ['server', 'hosting'], msg: 'We build server rooms, install systems, and configure security. Check "Our Projects" for educational videos.' },
            { keys: ['website', 'web', 'app', 'application', 'ui', 'ux'], msg: 'We design professional web and mobile apps. UI, UX, and website creation. Watch videos in Projects section.' },
            { keys: ['camera', 'security', 'surveillance'], msg: 'Advanced surveillance and security. PTZ and dome cameras. Remote 24/7 monitoring.' },
            { keys: ['smart home', 'iot'], msg: 'Smart buildings and IoT. Home automation and device integration.' },
            { keys: ['price', 'cost', 'how much'], msg: 'For exact pricing, contact us: 0022247774141 or WhatsApp or Itnord@outlook.fr' },
            { keys: ['contact', 'phone', 'email', 'whatsapp'], msg: 'Phone: 0022247774141 | WhatsApp: 0022247774141 | Email: Itnord@outlook.fr' },
            { keys: ['services', 'what do you offer', 'offers'], msg: 'We offer: 1) Networks, Wi-Fi, antennas 2) Low current, smart buildings, surveillance 3) Server rooms, engineering. "In the tech world we make the impossible."' },
            { keys: ['hello', 'hi', 'hey'], msg: 'Hello! How can we help? Ask about our services, pricing, or contact.' },
            { keys: ['consultation', 'consulting', 'technical'], msg: 'We offer technical consulting. Contact: 0022247774141 or Itnord@outlook.fr' },
            { keys: ['video', 'tutorial', 'learn'], msg: 'Check "Our Educational Projects" for videos on app design, servers, and websites.' }
        ]
    };

    const items = KB[lang] || KB.ar;
    for (const item of items) {
        for (const k of item.keys) {
            if (qLower.includes(k.toLowerCase())) return item.msg;
        }
    }

    return lang === 'ar'
        ? 'شكراً لسؤالك! يمكننا مساعدتك في: الشبكات والواي فاي، السيرفرات، تصميم التطبيقات والمواقع، المراقبة والأمان، المباني الذكية. تواصلوا: 0022247774141 أو واتساب أو Itnord@outlook.fr'
        : 'Thanks for asking! We help with: networks & Wi-Fi, servers, app & website design, surveillance, smart buildings. Contact: 0022247774141 or Itnord@outlook.fr';
}
