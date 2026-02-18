/**
 * IT NORD - Admin Panel (no login, DB-backed)
 * Connects to Python Flask API
 */

const API = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin + '/api' : '/api';

document.addEventListener('DOMContentLoaded', () => {
    showDashboard();
    initSections();
    initSaveHandlers();
});

function showDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    if (dashboard) dashboard.classList.remove('hidden');
    loadEditorData();
}

function initSections() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') === '#') e.preventDefault();
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

async function loadEditorData() {
    try {
        await Promise.all([
            loadMediaInputs(),
            loadFeaturesEditor(),
            loadToolsEditor(),
            loadButtonsEditor(),
            loadProjectsEditor()
        ]);
    } catch (e) {
        showToast('تحقق من تشغيل خادم Python (python app.py)');
    }
    initAddTool();
}

const MEDIA_KEYS = ['dish-hero-img', 'network-img', 'wifi-img', 'server-img', 'smart-img', 'integrated-img', 'security-img'];

async function loadMediaInputs() {
    let overrides = {};
    try {
        const r = await fetch(API + '/media');
        if (r.ok) overrides = await r.json();
    } catch (_) {}
    document.querySelectorAll('.media-upload-item').forEach(item => {
        const key = item.dataset.key;
        const preview = item.querySelector('.upload-preview');
        const zone = item.querySelector('.upload-zone');
        if (overrides[key]) {
            preview.src = overrides[key];
            zone?.classList.add('has-preview');
        }
        const fileInput = item.querySelector('.media-file-input');
        if (fileInput) fileInput.onchange = (e) => handleMediaFileSelect(e, item, key);
    });
}

async function handleMediaFileSelect(e, item, key) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
        showToast('يرجى اختيار ملف صورة');
        return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
        let dataUrl = reader.result;
        if (file.size > 500000) dataUrl = await compressImage(dataUrl, 800);
        const preview = item.querySelector('.upload-preview');
        const zone = item.querySelector('.upload-zone');
        preview.src = dataUrl;
        zone?.classList.add('has-preview');
        item.dataset.pendingBase64 = dataUrl;
    };
    reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

async function loadFeaturesEditor() {
    const container = document.getElementById('features-editor');
    if (!container) return;
    let data = [];
    try {
        const r = await fetch(API + '/features');
        if (r.ok) data = await r.json();
    } catch (_) {}
    if (data.length === 0) {
        data = [
            { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600', title: 'جودة التركيب وكفاءة الأداء' },
            { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600', title: 'هوائيات محسنة لتجربة إنترنت استثنائية.' },
            { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', title: 'سنوات من الخبرة في مد جسور الاتصال' }
        ];
    }
    renderFeaturesEditor(container, data);
}

function renderFeaturesEditor(container, data) {
    container.innerHTML = data.map((f, i) => `
        <div class="feature-editor-item" data-feature-idx="${i}">
            <label>البطاقة ${i + 1} — حمّل من الجهاز</label>
            <div class="feature-upload-zone">
                <input type="file" accept="image/*,video/*" data-feature-file="${i}">
                <span class="upload-hint">اختر صورة أو فيديو</span>
                <img class="upload-preview" data-feature-preview="${i}" alt="معاينة" style="max-height:80px;display:none">
            </div>
            <label>أو أدخل رابط (للفيديو)</label>
            <input type="url" data-feature-url="${i}" value="${(f.url || '').startsWith('http') ? (f.url || '').replace(/"/g, '&quot;') : ''}" placeholder="https://...">
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
        if (urlInput) urlInput.value = blobUrl;
        showToast('للديمومة استخدم رابط استضافة خارجية.');
    }
}

async function loadToolsEditor() {
    const container = document.getElementById('tools-editor');
    if (!container) return;
    let data = [];
    try {
        const r = await fetch(API + '/tools');
        if (r.ok) data = await r.json();
    } catch (_) {}
    if (data.length === 0) {
        data = [
            { label: 'شبكات الإنترنت', icon: '📶' },
            { label: 'هوائيات محسنة', icon: '📡' },
            { label: 'أنظمة الأمان', icon: '🔒' },
            { label: 'المباني الذكية', icon: '🏠' }
        ];
    }
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

function getToolsFromEditor() {
    const items = document.querySelectorAll('.tool-editor-item');
    return Array.from(items).map(item => ({
        icon: item.querySelector('[data-tool-icon]')?.value || '',
        label: item.querySelector('[data-tool-label]')?.value || ''
    }));
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

const COMM_BUTTON_TYPES = [
    { value: 'phone', label: 'هاتف' },
    { value: 'whatsapp', label: 'واتساب' },
    { value: 'email', label: 'بريد' },
    { value: 'location', label: 'موقع' }
];

async function loadButtonsEditor() {
    let data = { config: { position: 'left', vertical: 'bottom' }, buttons: [] };
    try {
        const r = await fetch(API + '/comm');
        if (r.ok) data = await r.json();
    } catch (_) {}
    if (!data.buttons || data.buttons.length === 0) {
        data.buttons = [
            { type: 'phone', href: 'tel:+22247774141', label: 'اتصل', title: '0022247774141', target: '' },
            { type: 'whatsapp', href: 'https://wa.me/22247774141', label: 'واتساب', title: '0022247774141', target: '_blank' },
            { type: 'email', href: 'mailto:Itnord@outlook.fr', label: 'بريد', title: 'البريد الإلكتروني', target: '' },
            { type: 'location', href: '#', label: 'الموقع', title: 'الموقع', target: '' }
        ];
    }
    document.getElementById('btn-position').value = data.config?.position || 'left';
    document.getElementById('btn-vertical').value = data.config?.vertical || 'bottom';
    renderButtonsEditor(data.buttons || []);
    document.getElementById('add-comm-btn').onclick = () => {
        const buttons = getButtonsFromEditor();
        buttons.push({ type: 'phone', href: '', label: 'زر جديد', title: '', target: '' });
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
            renderButtonsEditor(getButtonsFromEditor().filter((_, i) => i !== idx));
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

const PROJECT_CATEGORIES = [
    { value: 'app_design', label: 'تصميم التطبيقات' },
    { value: 'servers', label: 'إنشاء السيرفرات' },
    { value: 'websites', label: 'إنشاء المواقع' },
    { value: 'other', label: 'أخرى' }
];

async function loadProjectsEditor() {
    const container = document.getElementById('projects-editor');
    if (!container) return;
    let data = [];
    try {
        const r = await fetch(API + '/projects');
        if (r.ok) data = await r.json();
    } catch (_) {}
    renderProjectsEditor(container, data);
}

function renderProjectsEditor(container, data) {
    const base = window.location.origin || '';
    container.innerHTML = data.map((p, i) => `
        <div class="project-editor-item" data-project-id="${p.id}">
            <div class="project-editor-header">
                <span>${p.title_ar || p.title_en || 'مشروع ' + (i + 1)}</span>
                <a href="${base}/project/${p.id}" target="_blank" class="project-view-link">عرض</a>
            </div>
            <select data-project-category="${p.id}">
                ${PROJECT_CATEGORIES.map(c => `<option value="${c.value}" ${p.category === c.value ? 'selected' : ''}>${c.label}</option>`).join('')}
            </select>
            <label>العنوان (عربي)</label>
            <input type="text" data-project-title-ar="${p.id}" value="${(p.title_ar || '').replace(/"/g, '&quot;')}" placeholder="العنوان بالعربية">
            <label>العنوان (إنجليزي)</label>
            <input type="text" data-project-title-en="${p.id}" value="${(p.title_en || '').replace(/"/g, '&quot;')}" placeholder="Title in English">
            <label>الوصف (عربي)</label>
            <textarea data-project-desc-ar="${p.id}" placeholder="الوصف">${(p.description_ar || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            <label>الوصف (إنجليزي)</label>
            <textarea data-project-desc-en="${p.id}" placeholder="Description">${(p.description_en || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            <label>رابط الفيديو (YouTube أو مباشر)</label>
            <input type="url" data-project-video="${p.id}" value="${(p.video_url || '').replace(/"/g, '&quot;')}" placeholder="https://...">
            <label>رابط صورة الغلاف</label>
            <input type="text" data-project-thumb="${p.id}" value="${(p.thumbnail_url || '').replace(/"/g, '&quot;')}" placeholder="assets/... أو https://...">
            <div class="project-editor-actions">
                <button type="button" class="btn-remove" data-remove-project="${p.id}">حذف</button>
            </div>
        </div>
    `).join('');
    container.querySelectorAll('[data-remove-project]').forEach(btn => {
        btn.onclick = async () => {
            if (!confirm('حذف هذا المشروع؟')) return;
            try {
                await fetch(API + '/projects/' + btn.dataset.removeProject, { method: 'DELETE' });
                loadProjectsEditor();
                showToast('تم الحذف');
            } catch (e) {
                showToast('فشل الحذف');
            }
        };
    });
}

function initSaveHandlers() {
    document.querySelectorAll('[data-save]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const type = btn.dataset.save;
            try {
                if (type === 'media') await saveMedia();
                else if (type === 'features') await saveFeatures();
                else if (type === 'tools') await saveTools();
                else if (type === 'buttons') await saveButtons();
                else if (type === 'projects') await saveProjects();
            } catch (e) {
                showToast('فشل الحفظ. تحقق من تشغيل الخادم.');
            }
        });
    });
}

async function saveMedia() {
    const overrides = {};
    document.querySelectorAll('.media-upload-item').forEach(item => {
        const key = item.dataset.key;
        const pending = item.dataset.pendingBase64;
        const preview = item.querySelector('.upload-preview');
        if (pending) overrides[key] = pending;
        else if (preview?.src && preview.src.startsWith('data:')) overrides[key] = preview.src;
    });
    await fetch(API + '/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides)
    });
    showToast('تم حفظ التغييرات بنجاح');
}

async function saveFeatures() {
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
    await fetch(API + '/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
    });
    showToast('تم حفظ البطاقات بنجاح');
}

async function saveTools() {
    const items = document.querySelectorAll('.tool-editor-item');
    const tools = Array.from(items).map(item => ({
        icon: item.querySelector('[data-tool-icon]')?.value || '',
        label: item.querySelector('[data-tool-label]')?.value || ''
    }));
    await fetch(API + '/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tools)
    });
    showToast('تم حفظ الأدوات بنجاح');
}

async function saveButtons() {
    const config = {
        position: document.getElementById('btn-position').value,
        vertical: document.getElementById('btn-vertical').value
    };
    const buttons = getButtonsFromEditor();
    await fetch(API + '/comm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, buttons })
    });
    showToast('تم حفظ الأزرار بنجاح');
}

async function saveProjects() {
    const items = document.querySelectorAll('.project-editor-item');
    for (const item of items) {
        const id = parseInt(item.dataset.projectId, 10);
        const payload = {
            category: item.querySelector(`[data-project-category="${id}"]`)?.value || 'other',
            title_ar: item.querySelector(`[data-project-title-ar="${id}"]`)?.value || '',
            title_en: item.querySelector(`[data-project-title-en="${id}"]`)?.value || '',
            description_ar: item.querySelector(`[data-project-desc-ar="${id}"]`)?.value || '',
            description_en: item.querySelector(`[data-project-desc-en="${id}"]`)?.value || '',
            video_url: item.querySelector(`[data-project-video="${id}"]`)?.value || '',
            thumbnail_url: item.querySelector(`[data-project-thumb="${id}"]`)?.value || '',
            sort_order: 0
        };
        await fetch(API + '/projects/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
    showToast('تم حفظ المشاريع بنجاح');
}

document.getElementById('add-project-btn')?.addEventListener('click', async () => {
    try {
        const r = await fetch(API + '/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: 'other',
                title_ar: 'مشروع جديد',
                title_en: 'New Project',
                description_ar: '',
                description_en: '',
                video_url: '',
                thumbnail_url: '',
                sort_order: 999
            })
        });
        const j = await r.json();
        if (j.ok) {
            loadProjectsEditor();
            showToast('تم إضافة مشروع جديد');
        }
    } catch (e) {
        showToast('فشل. تحقق من تشغيل الخادم.');
    }
});

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
