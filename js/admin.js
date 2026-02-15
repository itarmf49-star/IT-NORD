/**
 * IT NORD - Admin Panel
 * Login: 47774141 / admin1234
 */

const CREDENTIALS = {
    phone: '47774141',
    password: 'admin1234'
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initLogin();
    initSections();
    initSaveHandlers();
    initLogout();
});

function checkAuth() {
    const token = sessionStorage.getItem('itnord_admin');
    if (token === 'authenticated') {
        showDashboard();
    }
}

function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        const phone = document.getElementById('login-phone').value.trim();
        const password = document.getElementById('login-password').value;

        if (phone === CREDENTIALS.phone && password === CREDENTIALS.password) {
            sessionStorage.setItem('itnord_admin', 'authenticated');
            errorEl.textContent = '';
            showDashboard();
        } else {
            errorEl.textContent = 'رقم الهاتف أو كلمة المرور غير صحيحة';
        }
    };
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadEditorData();
}

function initSections() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.hasAttribute('href') && item.getAttribute('href') === '#') {
                e.preventDefault();
            }
            const section = item.dataset.section;
            if (!section) return;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
            const target = document.getElementById('section-' + section);
            if (target) target.classList.remove('hidden');
        });
    });
}

function loadEditorData() {
    loadMediaInputs();
    loadFeaturesEditor();
    loadToolsEditor();
    loadButtonsEditor();
    initAddTool();
}

const MEDIA_KEYS = ['dish-hero-img', 'network-img', 'wifi-img', 'server-img', 'smart-img', 'integrated-img', 'security-img'];

function loadMediaInputs() {
    const overrides = JSON.parse(localStorage.getItem('itnord_media_overrides') || '{}');
    document.querySelectorAll('.media-upload-item').forEach(item => {
        const key = item.dataset.key;
        const preview = item.querySelector('.upload-preview');
        const zone = item.querySelector('.upload-zone');
        if (overrides[key]) {
            preview.src = overrides[key];
            zone?.classList.add('has-preview');
        }
        const fileInput = item.querySelector('.media-file-input');
        if (fileInput) {
            fileInput.onchange = (e) => handleMediaFileSelect(e, item, key);
        }
    });
}

async function handleMediaFileSelect(e, item, key) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار ملف صورة');
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        let dataUrl = reader.result;
        if (file.size > 500000) {
            dataUrl = await compressImage(dataUrl, 800);
        }
        if (dataUrl && typeof dataUrl === 'string') {
            const preview = item.querySelector('.upload-preview');
            const zone = item.querySelector('.upload-zone');
            preview.src = dataUrl;
            zone?.classList.add('has-preview');
            item.dataset.pendingBase64 = dataUrl;
        }
    };
    reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) {
                h = (h * maxWidth) / w;
                w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

function loadFeaturesEditor() {
    const container = document.getElementById('features-editor');
    if (!container) return;
    const features = JSON.parse(localStorage.getItem('itnord_features') || 'null');
    const defaultFeatures = [
        { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600', title: 'جودة التركيب وكفاءة الأداء' },
        { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600', title: 'هوائيات محسنة لتجربة إنترنت استثنائية.' },
        { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', title: 'سنوات من الخبرة في مد جسور الاتصال' }
    ];
    const data = features || defaultFeatures;
    container.innerHTML = data.map((f, i) => `
        <div class="feature-editor-item" data-feature-idx="${i}">
            <label>البطاقة ${i + 1} — حمّل من الجهاز</label>
            <div class="feature-upload-zone">
                <input type="file" accept="image/*,video/*" data-feature-file="${i}">
                <span class="upload-hint">اختر صورة أو فيديو</span>
                <img class="upload-preview" data-feature-preview="${i}" alt="معاينة" style="max-height:80px;display:none">
            </div>
            <label>أو أدخل رابط (للفيديو)</label>
            <input type="url" data-feature-url="${i}" value="${(f.url || '').startsWith('http') ? f.url : ''}" placeholder="https://...">
            <label>النص</label>
            <input type="text" data-feature-title="${i}" value="${(f.title || '').replace(/"/g, '&quot;')}" placeholder="عنوان البطاقة">
        </div>
    `).join('');
    container.querySelectorAll('[data-feature-file]').forEach(input => {
        input.onchange = (e) => handleFeatureFileSelect(e, parseInt(input.dataset.featureFile, 10));
    });
    data.forEach((f, i) => {
        if (f.url && f.url.startsWith('data:')) {
            const preview = container.querySelector(`[data-feature-preview="${i}"]`);
            const zone = container.querySelector(`[data-feature-idx="${i}"] .feature-upload-zone`);
            if (preview) {
                preview.src = f.url;
                preview.style.display = 'block';
                zone?.classList.add('has-preview');
            }
        }
    });
}

async function handleFeatureFileSelect(e, idx) {
    const file = e.target.files?.[0];
    if (!file) return;
    const container = document.getElementById('features-editor');
    const preview = container?.querySelector(`[data-feature-preview="${idx}"]`);
    const zone = container?.querySelector(`[data-feature-idx="${idx}"] .feature-upload-zone`);
    const urlInput = container?.querySelector(`[data-feature-url="${idx}"]`);
    if (!container || !preview) return;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
            let dataUrl = reader.result;
            if (file.size > 400000) dataUrl = await compressImage(dataUrl, 600);
            preview.src = dataUrl;
            preview.style.display = 'block';
            if (urlInput) urlInput.value = dataUrl;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        const blobUrl = URL.createObjectURL(file);
        preview.src = '';
        preview.style.display = 'none';
        if (urlInput) urlInput.value = blobUrl;
        showToast('الفيديو سيظهر حتى إعادة التحميل. للديمومة استخدم رابط استضافة خارجية.');
    }
}

function loadToolsEditor() {
    const container = document.getElementById('tools-editor');
    if (!container) return;
    const tools = JSON.parse(localStorage.getItem('itnord_tools') || 'null');
    const defaultTools = [
        { label: 'شبكات الإنترنت', icon: '📶' },
        { label: 'هوائيات محسنة', icon: '📡' },
        { label: 'أنظمة الأمان', icon: '🔒' },
        { label: 'المباني الذكية', icon: '🏠' }
    ];
    const data = tools || defaultTools;
    renderToolsEditor(container, data);
}

function renderToolsEditor(container, data) {
    container.innerHTML = data.map((t, i) => `
        <div class="tool-editor-item" data-tool-idx="${i}">
            <input type="text" class="tool-icon-input" value="${t.icon || ''}" placeholder="أيقونة" data-tool-icon="${i}">
            <input type="text" value="${t.label || ''}" placeholder="اسم الأداة" data-tool-label="${i}">
            <button type="button" class="btn-remove" data-remove-tool="${i}">حذف</button>
        </div>
    `).join('');
    initAddTool();
    initRemoveTool(container);
}

function initAddTool() {
    const btn = document.getElementById('add-tool-btn');
    const container = document.getElementById('tools-editor');
    if (!btn || !container) return;
    btn.onclick = () => {
        const tools = getToolsFromEditor();
        tools.push({ label: '', icon: '🔧' });
        renderToolsEditor(container, tools);
    };
}

function initRemoveTool(container) {
    if (!container) return;
    container.querySelectorAll('[data-remove-tool]').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.removeTool, 10);
            const tools = getToolsFromEditor().filter((_, i) => i !== idx);
            renderToolsEditor(container, tools);
        };
    });
}

function getToolsFromEditor() {
    const items = document.querySelectorAll('.tool-editor-item');
    return Array.from(items).map(item => ({
        icon: item.querySelector('[data-tool-icon]')?.value || '',
        label: item.querySelector('[data-tool-label]')?.value || ''
    }));
}

function initSaveHandlers() {
    document.querySelectorAll('[data-save]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.save;
            if (type === 'media') saveMedia();
            if (type === 'features') saveFeatures();
            if (type === 'tools') saveTools();
            if (type === 'buttons') saveButtons();
        });
    });
}

function saveMedia() {
    const overrides = JSON.parse(localStorage.getItem('itnord_media_overrides') || '{}');
    document.querySelectorAll('.media-upload-item').forEach(item => {
        const key = item.dataset.key;
        const pending = item.dataset.pendingBase64;
        const preview = item.querySelector('.upload-preview');
        if (pending) {
            overrides[key] = pending;
        } else if (preview?.src && preview.src.startsWith('data:')) {
            overrides[key] = preview.src;
        }
    });
    localStorage.setItem('itnord_media_overrides', JSON.stringify(overrides));
    showToast('تم حفظ التغييرات بنجاح');
}

function saveFeatures() {
    const items = document.querySelectorAll('.feature-editor-item');
    const features = Array.from(items)
        .sort((a, b) => parseInt(a.dataset.featureIdx, 10) - parseInt(b.dataset.featureIdx, 10))
        .map(item => {
            const i = item.dataset.featureIdx;
            const urlEl = item.querySelector(`[data-feature-url="${i}"]`);
            const titleEl = item.querySelector(`[data-feature-title="${i}"]`);
            const preview = item.querySelector(`[data-feature-preview="${i}"]`);
            let url = urlEl?.value?.trim() || '';
            if (preview?.src && preview.src.startsWith('data:')) url = preview.src;
            return { url, title: titleEl?.value || '' };
        });
    localStorage.setItem('itnord_features', JSON.stringify(features));
    showToast('تم حفظ البطاقات بنجاح');
}

function saveTools() {
    const tools = getToolsFromEditor();
    localStorage.setItem('itnord_tools', JSON.stringify(tools));
    showToast('تم حفظ الأدوات بنجاح');
}

const COMM_BUTTON_TYPES = [
    { value: 'phone', label: 'هاتف' },
    { value: 'whatsapp', label: 'واتساب' },
    { value: 'email', label: 'بريد' },
    { value: 'location', label: 'موقع' }
];

function loadButtonsEditor() {
    const config = JSON.parse(localStorage.getItem('itnord_comm_buttons') || 'null');
    const defaultConfig = {
        buttons: [
            { type: 'phone', href: 'tel:+96147774141', label: 'اتصل', title: 'اتصل بنا' },
            { type: 'whatsapp', href: 'https://wa.me/96147774141', label: 'واتساب', title: 'واتساب', target: '_blank' },
            { type: 'email', href: 'mailto:info@itnord.com', label: 'بريد', title: 'البريد الإلكتروني' },
            { type: 'location', href: '#', label: 'الموقع', title: 'الموقع' }
        ],
        position: 'left',
        vertical: 'bottom'
    };
    const data = config || defaultConfig;
    document.getElementById('btn-position').value = data.position || 'left';
    document.getElementById('btn-vertical').value = data.vertical || 'bottom';
    renderButtonsEditor(data.buttons || defaultConfig.buttons);
    document.getElementById('add-comm-btn').onclick = () => {
        const buttons = getButtonsFromEditor();
        buttons.push({ type: 'phone', href: '', label: 'زر جديد', title: '' });
        renderButtonsEditor(buttons);
    };
}

function renderButtonsEditor(buttons) {
    const container = document.getElementById('buttons-editor');
    if (!container) return;
    container.innerHTML = buttons.map((b, i) => `
        <div class="comm-btn-editor-item" data-btn-idx="${i}">
            <select data-btn-type="${i}">
                ${COMM_BUTTON_TYPES.map(t => `<option value="${t.value}" ${b.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
            </select>
            <input type="text" placeholder="الرابط (href)" data-btn-href="${i}" value="${b.href || ''}">
            <input type="text" placeholder="النص المعروض" data-btn-label="${i}" value="${b.label || ''}">
            <input type="text" placeholder="العنوان (title)" data-btn-title="${i}" value="${b.title || ''}">
            <input type="text" placeholder="target (_blank أو اترك فارغاً)" data-btn-target="${i}" value="${b.target || ''}">
            <button type="button" class="btn-remove" data-remove-btn="${i}">حذف</button>
        </div>
    `).join('');
    container.querySelectorAll('[data-remove-btn]').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.removeBtn, 10);
            const buttons = getButtonsFromEditor().filter((_, i) => i !== idx);
            renderButtonsEditor(buttons);
        };
    });
}

function getButtonsFromEditor() {
    const items = document.querySelectorAll('.comm-btn-editor-item');
    return Array.from(items).map(item => {
        const i = item.dataset.btnIdx;
        return {
            type: item.querySelector(`[data-btn-type="${i}"]`)?.value || 'phone',
            href: item.querySelector(`[data-btn-href="${i}"]`)?.value || '#',
            label: item.querySelector(`[data-btn-label="${i}"]`)?.value || '',
            title: item.querySelector(`[data-btn-title="${i}"]`)?.value || '',
            target: item.querySelector(`[data-btn-target="${i}"]`)?.value || ''
        };
    });
}

function saveButtons() {
    const config = {
        buttons: getButtonsFromEditor(),
        position: document.getElementById('btn-position').value,
        vertical: document.getElementById('btn-vertical').value
    };
    localStorage.setItem('itnord_comm_buttons', JSON.stringify(config));
    showToast('تم حفظ أزرار التواصل بنجاح');
}

function initLogout() {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.onclick = () => {
            sessionStorage.removeItem('itnord_admin');
            location.reload();
        };
    }
}

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}
