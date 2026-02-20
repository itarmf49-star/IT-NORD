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
        playVideo: 'تشغيل الفيديو',
        // Services section
        serviceDistribute: 'خدمات توزيع تضمن وصول',
        signalStrong: 'الإشارة بقوة',
        wifiCoverageTitle: 'حوّل منزلك إلى منطقة تغطية كاملة',
        wifiCoverageDesc: 'شبكة منزلية بلا حدود: توزيع إنترنت يغطي كل احتياجات عائلتك المتصلة.',
        digitalFoundation: 'من شبكات البيانات إلى أنظمة الأمان والتيار الخفيف، نحن نبني الأساس الرقمي.',
        smartBuildingsTitle: 'المباني الذكية',
        smartBuildingsDesc: 'حلول التيار الخفيف والاتصالات للمباني الذكية: نوفر أساساً تكنولوجياً متيناً لمنشآتك.',
        // Digital Imagination slides
        dimSubtitle: 'Where technology meets creativity',
        dimSlide1Title: 'كاميرات المراقبة المتطورة',
        dimSlide1Desc: 'حلول أمان متقدمة بكاميرات PTZ عالية الدقة. مراقبة 360 درجة مع رؤية ليلية بالأشعة تحت الحمراء لحماية منشآتك على مدار الساعة.',
        dimSlide2Title: 'تدقيق الطاقة والحرارة',
        dimSlide2Desc: 'تحليل احترافي لفقدان الطاقة في المباني. نحدد نقاط التحسين ونقلل الفواتير عبر حلول عزل وكفاءة طاقية متكاملة.',
        dimSlide3Title: 'أنظمة المراقبة الذكية',
        dimSlide3Desc: 'كاميرات قبة عصرية تصميم أنيق وتكامل سلس مع أسقف المباني. تغطية شاملة مع أجهزة استشعار عالية الحساسية.',
        dimSlide4Title: 'تحكم الوصول والفيديو',
        dimSlide4Desc: 'أنظمة فيديو وتحكم دخول متكاملة: بوابات فيديو IP، مراقبة مركزية، وربط كاميرات وقراءات البطاقات في شبكة أمان واحدة.',
        dimSlide5Title: 'إنترنت الأشياء والمنزل الذكي',
        dimSlide5Desc: 'توصيل كل غرفة بشبكة واحدة. أجهزة ذكية مترابطة من غرفة المعيشة إلى المطبخ والمكتب، راحة وكفاءة في مكان واحد.',
        dimSlide6Title: 'الخيال الرقمي والتقنية',
        dimSlide6Desc: 'حلول تفاعلية تجمع الكاميرات، السحابة، الشبكة والموقع. واجهات متقدمة لإدارة ومراقبة أنظمتك من مكان واحد.',
        dimSlide7Title: 'حماية احترافية بأعلى المعايير',
        dimSlide7Desc: 'كاميرات PTZ بقدرات تكبير وحركة دقيقة. حلول أمان موثوقة للمؤسسات والمباني التجارية والسكنية.',
        dimSlide8Title: 'الهوائيات والاتصال اللاسلكي',
        dimSlide8Desc: 'هوائيات احترافية لربط المواقع وتوفير إنترنت عالي السرعة. جسور لاسلكية بعيدة المدى لتغطية مثالية.',
        dimSlide9Title: 'أنظمة التسخين الذكية',
        dimSlide9Desc: 'منظمات حرارة لاسلكية لكل منطقة. وضع اقتصاد ووضع راحة وبرمجة يومية وأسبوعية لتوفير الطاقة.',
        // Business Summary
        businessSummaryTitle: 'IT NORD BUSINESS SUMMARY',
        businessSummaryIntro: 'IT NORD is a technical partner specialized in providing cutting-edge engineering solutions for infrastructure and smart systems, with a focus on quality and precision in execution.',
        businessSummaryIntroAr: 'شريكاً تقنياً متخصصاً في تقديم الحلول الهندسية المتطورة للبنية التحتية والأنظمة الذكية، مع التركيز على الجودة والدقة في التنفيذ',
        serviceCat1Title: '1. حلول الشبكات والاتصالات (Network & Connectivity)',
        serviceCat1Item1: 'تصميم وتنفيذ شبكات الإنترنت: توفير بنية تحتية قوية للبيانات والاتصالات تعتمد عليها المباني الحديثة.',
        serviceCat1Item2: 'حلول الواي فاي (Wi-Fi Solutions): تقنيات متقدمة تضمن تغطية لاسلكية شاملة وقوية لكل زوايا المنزل أو المبنى (توزيع إشارة ذكي).',
        serviceCat1Item3: 'الجسور اللاسلكية والهوائيات: تركيب هوائيات احترافية لتحسين تجربة الإنترنت وربط المواقع عبر جسور اتصال لاسلكية بعيدة المدى.',
        serviceCat2Title: '2. أنظمة التيار الخفيف والمباني الذكية (Low Current & Smart Home)',
        serviceCat2Item1: 'أتمتة المباني: تحويل المباني العادية إلى مباني ذكية توفر أساساً تكنولوجياً متطوراً.',
        serviceCat2Item2: 'أنظمة المراقبة والأمان: تركيب أحدث أنظمة كاميرات المراقبة لضمان حماية المنشآت والعائلات ومراقبتها عن بعد في أي وقت ومن أي مكان.',
        serviceCat2Item3: 'تكامل الأنظمة: ربط الأجهزة المختلفة (هاتف، حاسوب، تلفاز) عبر وحدات وكابلات متطورة لضمان اتصال ذكي وآمن (Modules CPL).',
        serviceCat3Title: '3. الخدمات الهندسية والاحترافية (Engineering Services)',
        serviceCat3Item1: 'الأساس الرقمي: بناء وتجهيز غرف السيرفرات (Server Racks) وتنظيم الكابلات باحترافية عالية لضمان استقرار الخدمة.',
        serviceCat3Item2: 'الاستشارات الفنية: تقديم حلول هندسية متكاملة تتناسب مع احتياجات المشاريع المتطورة والمباني الحديثة.',
        serviceCat3Item3: 'الدقة والكفاءة: شعار الشركة "في العالم الفني نصنع المستحيل".',
        // Extra content
        integratedSolutionsText: 'حلول متكاملة لبيئة متصلة وذكية.',
        securityText: 'منزلك في أمان دائماً: راقب واطمئن أينما كنت.',
        // Contact
        whatsapp: 'واتساب',
        email: 'البريد',
        // New sections
        ourServices: 'خدماتنا التفصيلية',
        serviceWifi: 'حلول الواي فاي والجسور اللاسلكية',
        serviceWifiDesc: 'تغطية لاسلكية شاملة، هوائيات احترافية، جسور بعيدة المدى لربط المواقع.',
        serviceMonitoring: 'أنظمة المراقبة الذكية',
        serviceMonitoringDesc: 'تركيب كاميرات المراقبة عالية الدقة، مراقبة عن بُعد، حماية على مدار الساعة.',
        serviceLightCurrent: 'حلول التيار الخفيف وأتمتة المباني',
        serviceLightCurrentDesc: 'شبكات البيانات، أنظمة التحكم، تحويل المباني إلى مباني ذكية.',
        portfolioTitle: 'معرض أعمالنا',
        portfolioSubtitle: 'صور حقيقية لمشاريع IT NORD المنفذة — قبل وبعد التركيب',
        before: 'قبل',
        after: 'بعد',
        getQuoteTitle: 'احصل على عرض أسعار',
        getQuoteSubtitle: 'املأ النموذج وسنتواصل معك في أقرب وقت',
        quoteName: 'الاسم الكامل',
        quotePhone: 'رقم الهاتف',
        selectService: 'اختر نوع الخدمة',
        optCameras: 'تركيب كاميرات المراقبة',
        optWifi: 'تقوية الواي فاي والهوائيات',
        optNetworks: 'شبكات التيار الخفيف',
        optSmartHome: 'حلول المنزل الذكي',
        optOther: 'أخرى',
        sendQuote: 'إرسال الطلب',
        quoteSuccess: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
        quoteError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        testimonialsTitle: 'آراء عملائنا',
        calcTitle: 'حاسبة التقدير الأولي',
        calcSubtitle: 'اختر عدد الغرف في منزلك للحصول على تقدير أولي لنوع الشبكة المطلوبة',
        calcRooms: 'عدد الغرف',
        techBlog: 'المدونة التقنية'
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
        playVideo: 'Play Video',
        // Services section
        serviceDistribute: 'Distribution services ensure',
        signalStrong: 'strong signal reach',
        wifiCoverageTitle: 'Transform your home into a full coverage zone',
        wifiCoverageDesc: 'Boundless home network: Internet distribution covering all your family\'s connected needs.',
        digitalFoundation: 'From data networks to security and low-current systems, we build the digital foundation.',
        smartBuildingsTitle: 'Smart Buildings',
        smartBuildingsDesc: 'Low-current and communications solutions for smart buildings: We provide a solid technological foundation for your facilities.',
        // Digital Imagination slides
        dimSubtitle: 'Where technology meets creativity',
        dimSlide1Title: 'Advanced Surveillance Cameras',
        dimSlide1Desc: 'Advanced security solutions with high-definition PTZ cameras. 360-degree monitoring with infrared night vision to protect your facilities around the clock.',
        dimSlide2Title: 'Energy and Heat Auditing',
        dimSlide2Desc: 'Professional analysis of energy loss in buildings. We identify improvement points and reduce bills through integrated insulation and energy efficiency solutions.',
        dimSlide3Title: 'Smart Surveillance Systems',
        dimSlide3Desc: 'Modern dome cameras with elegant design and seamless integration with building ceilings. Comprehensive coverage with highly sensitive sensors.',
        dimSlide4Title: 'Access Control and Video',
        dimSlide4Desc: 'Integrated video and access control systems: IP video intercoms, centralized monitoring, and linking cameras and card readers in a single security network.',
        dimSlide5Title: 'Internet of Things and Smart Home',
        dimSlide5Desc: 'Connecting every room to a single network. Interconnected smart devices from living room to kitchen and office, comfort and efficiency in one place.',
        dimSlide6Title: 'Digital Imagination and Technology',
        dimSlide6Desc: 'Interactive solutions combining cameras, cloud, network, and location. Advanced interfaces for managing and monitoring your systems from one place.',
        dimSlide7Title: 'Professional Protection to Highest Standards',
        dimSlide7Desc: 'PTZ cameras with precise zoom and movement capabilities. Reliable security solutions for institutions and commercial and residential buildings.',
        dimSlide8Title: 'Antennas and Wireless Connectivity',
        dimSlide8Desc: 'Professional antennas for connecting sites and providing high-speed internet. Long-range wireless bridges for optimal coverage.',
        dimSlide9Title: 'Smart Heating Systems',
        dimSlide9Desc: 'Wireless thermostats for each zone. Economy mode, comfort mode, and daily and weekly programming to save energy.',
        // Business Summary
        businessSummaryTitle: 'IT NORD BUSINESS SUMMARY',
        businessSummaryIntro: 'IT NORD is a technical partner specialized in providing cutting-edge engineering solutions for infrastructure and smart systems, with a focus on quality and precision in execution.',
        businessSummaryIntroAr: 'شريكاً تقنياً متخصصاً في تقديم الحلول الهندسية المتطورة للبنية التحتية والأنظمة الذكية، مع التركيز على الجودة والدقة في التنفيذ',
        serviceCat1Title: '1. Network & Connectivity Solutions',
        serviceCat1Item1: 'Internet network design and implementation: Providing strong data and communications infrastructure that modern buildings rely on.',
        serviceCat1Item2: 'Wi-Fi Solutions: Advanced technologies ensuring comprehensive and strong wireless coverage for every corner of your home or building (smart signal distribution).',
        serviceCat1Item3: 'Wireless bridges and antennas: Installation of professional antennas to improve internet experience and connect sites via long-range wireless communication bridges.',
        serviceCat2Title: '2. Low Current & Smart Home Systems',
        serviceCat2Item1: 'Building automation: Transforming ordinary buildings into smart buildings providing advanced technological foundation.',
        serviceCat2Item2: 'Surveillance and security systems: Installation of latest surveillance camera systems to ensure protection of facilities and families, monitoring remotely anytime, anywhere.',
        serviceCat2Item3: 'System integration: Connecting different devices (phone, computer, TV) via advanced modules and cables ensuring smart and secure connection (CPL Modules).',
        serviceCat3Title: '3. Engineering & Professional Services',
        serviceCat3Item1: 'Digital foundation: Building and equipping server rooms (Server Racks) and organizing cables with high professionalism to ensure service stability.',
        serviceCat3Item2: 'Technical consulting: Providing integrated engineering solutions suitable for advanced projects and modern buildings.',
        serviceCat3Item3: 'Precision and efficiency: Company motto "In the technical world we make the impossible."',
        // Extra content
        integratedSolutionsText: 'Integrated solutions for a connected and smart environment.',
        securityText: 'Your home is always secure: Monitor and rest assured wherever you are.',
        // Contact
        whatsapp: 'WhatsApp',
        email: 'Email',
        // New sections
        ourServices: 'Our Detailed Services',
        serviceWifi: 'Wi-Fi and Wireless Bridges Solutions',
        serviceWifiDesc: 'Full wireless coverage, professional antennas, long-range bridges to connect sites.',
        serviceMonitoring: 'Intelligent Monitoring Systems',
        serviceMonitoringDesc: 'HD surveillance camera installation, remote monitoring, 24/7 protection.',
        serviceLightCurrent: 'Light Current and Building Automation',
        serviceLightCurrentDesc: 'Data networks, control systems, transforming buildings into smart buildings.',
        portfolioTitle: 'Our Work Gallery',
        portfolioSubtitle: 'Real photos of IT NORD projects — before and after installation',
        before: 'Before',
        after: 'After',
        getQuoteTitle: 'Get a Quote',
        getQuoteSubtitle: 'Fill out the form and we will contact you shortly',
        quoteName: 'Full Name',
        quotePhone: 'Phone Number',
        selectService: 'Select service type',
        optCameras: 'Surveillance cameras installation',
        optWifi: 'Wi-Fi strengthening and antennas',
        optNetworks: 'Light current networks',
        optSmartHome: 'Smart home solutions',
        optOther: 'Other',
        sendQuote: 'Submit Request',
        quoteSuccess: 'Your request has been sent! We will contact you soon.',
        quoteError: 'An error occurred. Please try again.',
        testimonialsTitle: 'Customer Testimonials',
        calcTitle: 'Preliminary Estimate Calculator',
        calcSubtitle: 'Choose the number of rooms in your home for a preliminary network estimate',
        calcRooms: 'Number of rooms',
        techBlog: 'Tech Blog'
    }
};

const CALC_ESTIMATES = {
    ar: {
        1: 'شقة صغيرة: نقطة وصول واحدة (AP) تكفي.',
        2: 'شقة متوسطة: نقطتا وصول (AP) لتغطية كاملة.',
        3: 'منزل صغير: 2-3 نقاط وصول مع راوتر رئيسي.',
        4: 'منزل متوسط: 3-4 نقاط وصول + كابلات شبكة.',
        5: 'منزل كبير: 4-5 نقاط + شبكة هيكلية.',
        6: 'فيلا: 5-6 نقاط + شبكة ألياف.',
        7: 'منزل واسع: شبكة احترافية مع توزيع ذكي.',
        8: 'مبنى صغير: شبكة enterprise مع عدة طبقات.',
        9: 'مبنى متوسط: شبكة متكاملة + إدارة مركزية.',
        10: 'مبنى كبير: حلول enterprise كاملة.'
    },
    en: {
        1: 'Small apartment: One access point (AP) is enough.',
        2: 'Medium apartment: Two APs for full coverage.',
        3: 'Small house: 2-3 APs with main router.',
        4: 'Medium house: 3-4 APs + network cables.',
        5: 'Large house: 4-5 APs + structured cabling.',
        6: 'Villa: 5-6 APs + fiber network.',
        7: 'Spacious home: Professional network with smart distribution.',
        8: 'Small building: Enterprise network with multiple floors.',
        9: 'Medium building: Integrated network + central management.',
        10: 'Large building: Full enterprise solutions.'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initOurWorkLinks();
    initHeroSlider();
    loadFeatures();
    loadTools();
    loadMediaOverrides();
    loadProjects();
    loadTestimonials();
    initQuoteForm();
    initCalculator();
    initOurWorkDropdown();
    initContactButton();
    initChat();
    initDimCarousel();
});

function initHeroSlider() {
    const track = document.getElementById('hero-slider-track');
    const dots = document.getElementById('hero-slider-dots');
    if (!track || !dots) return;
    const slides = track.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    let idx = 0;
    const INTERVAL = 6000;
    slides.forEach((s, i) => {
        const d = document.createElement('span');
        d.className = 'hero-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Slide ' + (i + 1));
        d.onclick = () => go(idx = i);
        dots.appendChild(d);
    });
    const dotEls = dots.querySelectorAll('.hero-dot');
    function go(i) {
        idx = (i + slides.length) % slides.length;
        slides.forEach((s, j) => s.classList.toggle('active', j === idx));
        dotEls.forEach((d, j) => d.classList.toggle('active', j === idx));
    }
    let t = setInterval(() => go(idx + 1), INTERVAL);
    document.addEventListener('visibilitychange', () => {
        clearInterval(t);
        if (!document.hidden) t = setInterval(() => go(idx + 1), INTERVAL);
    });
}

function loadTestimonials() {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    const lang = getCurrentLang();
    const fallback = [
        { name_ar: 'أحمد محمد', name_en: 'Ahmed Mohamed', text_ar: 'خدمة ممتازة وتركيب احترافي.', text_en: 'Excellent service and professional installation.', role_ar: 'عميل', role_en: 'Client' },
    ];
    if (API) {
        fetch(API + '/testimonials').then(r => r.ok ? r.json() : fallback).then(data => {
            const list = (data && data.length) ? data : fallback;
            grid.innerHTML = list.map(t => {
                const n = lang === 'ar' ? (t.name_ar || t.name_en) : (t.name_en || t.name_ar);
                const txt = lang === 'ar' ? (t.text_ar || t.text_en) : (t.text_en || t.text_ar);
                const r = lang === 'ar' ? (t.role_ar || t.role_en) : (t.role_en || t.role_ar);
                return `<div class="testimonial-card"><p>${txt}</p><span class="testimonial-name">${n}</span><span class="testimonial-role">${r}</span></div>`;
            }).join('');
        }).catch(() => { grid.innerHTML = fallback.map(t => `<div class="testimonial-card"><p>${t.text_ar}</p><span class="testimonial-name">${t.name_ar}</span></div>`).join(''); });
    } else {
        grid.innerHTML = fallback.map(t => `<div class="testimonial-card"><p>${t.text_ar}</p><span class="testimonial-name">${t.name_ar}</span></div>`).join('');
    }
}

function initQuoteForm() {
    const form = document.getElementById('quote-form');
    const msg = document.getElementById('quote-message');
    if (!form || !msg) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = { name: fd.get('name'), service_type: fd.get('service_type'), phone: fd.get('phone') };
        msg.classList.add('hidden');
        if (!API) {
            msg.textContent = getCurrentLang() === 'ar' ? 'سيتم إرسال الطلب عند الاتصال بالسيرفر.' : 'Request will be sent when connected to server.';
            msg.classList.remove('hidden');
            return;
        }
        try {
            const r = await fetch(API + '/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const j = await r.json();
            const t = TRANSLATIONS[getCurrentLang()];
            msg.textContent = j.ok ? (t.quoteSuccess || 'تم إرسال طلبك بنجاح!') : (t.quoteError || 'حدث خطأ.');
            msg.classList.remove('hidden');
            if (j.ok) form.reset();
        } catch {
            msg.textContent = TRANSLATIONS[getCurrentLang()].quoteError;
            msg.classList.remove('hidden');
        }
    });
}

function initCalculator() {
    const input = document.getElementById('calc-rooms');
    const valueSpan = document.getElementById('calc-value');
    const result = document.getElementById('calc-result');
    if (!input || !valueSpan || !result) return;
    const update = () => {
        const v = parseInt(input.value, 10);
        valueSpan.textContent = v;
        const lang = getCurrentLang();
        const est = CALC_ESTIMATES[lang] || CALC_ESTIMATES.ar;
        result.textContent = est[v] || est[Math.min(v, 10)];
    };
    input.addEventListener('input', update);
    update();
}

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
    if (document.getElementById('calc-result') && document.getElementById('calc-rooms')) {
        const v = parseInt(document.getElementById('calc-rooms').value, 10);
        const est = CALC_ESTIMATES[lang] || CALC_ESTIMATES.ar;
        document.getElementById('calc-result').textContent = est[v] || est[Math.min(v, 10)];
    }
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    document.querySelectorAll('.hero-slogan.en').forEach(el => el.style.display = lang === 'en' ? 'block' : 'none');
    document.querySelectorAll('.hero-slogan.ar').forEach(el => el.style.display = lang === 'ar' ? 'block' : 'none');
    // Show/hide language-specific intro paragraphs
    const summaryIntro = document.querySelector('.summary-intro');
    const summaryIntroAr = document.querySelector('.summary-intro-ar');
    if (summaryIntro) summaryIntro.style.display = lang === 'en' ? 'block' : 'none';
    if (summaryIntroAr) summaryIntroAr.style.display = lang === 'ar' ? 'block' : 'none';
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
