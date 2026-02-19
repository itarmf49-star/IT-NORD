# دليل النشر على Vercel

## المشكلة: NOT_FOUND Error

Vercel يتوقع:
- **ملفات ثابتة** (HTML/CSS/JS) → يعمل تلقائياً
- **Serverless functions** في مجلد `api/` → يحتاج إعداد

تطبيق Flask هو **WSGI application** يحتاج محول (adapter) ليعمل كـ serverless function.

## الحل

### 1. هيكل الملفات المطلوب

```
IT NORD 1/
├── api/
│   └── index.py          ← Serverless function wrapper
├── app.py                ← Flask app
├── vercel.json           ← Vercel configuration
├── index.html
├── admin.html
└── ...
```

### 2. ملف `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### 3. ملف `api/index.py`

يحتوي على:
- استيراد Flask app
- محول WSGI → Vercel handler
- تهيئة قاعدة البيانات

## النشر

```bash
vercel
```

أو عبر GitHub:
1. ارفع الكود إلى GitHub
2. اربط المستودع في Vercel Dashboard
3. Vercel سيكتشف `vercel.json` تلقائياً

## بدائل للنشر

### 1. **Render.com** (موصى به لـ Flask)
- يدعم Flask مباشرة
- قاعدة بيانات PostgreSQL مجانية
- أسهل إعداد

### 2. **Railway**
- دعم ممتاز لـ Python/Flask
- SQLite يعمل بشكل جيد

### 3. **Heroku**
- كلاسيكي لكن مدفوع الآن

### 4. **PythonAnywhere**
- مجاني للمشاريع الصغيرة
- يدعم Flask و SQLite

## ملاحظات مهمة

⚠️ **SQLite على Vercel:**
- الملفات في `/tmp` تُحذف بعد كل request
- استخدم قاعدة بيانات خارجية (PostgreSQL, MongoDB)
- أو استخدم Vercel KV/Postgres

✅ **للاختبار المحلي:**
```bash
python app.py
```
