# -*- coding: utf-8 -*-
"""
IT NORD - Python Flask backend with SQLite database
Serves the site and provides API for admin control panel
"""

import os
import json
import sqlite3
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_PATH = Path(__file__).parent / 'data' / 'itnord.db'


def get_db():
    """Get SQLite connection"""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create database tables with initial data"""
    conn = get_db()
    c = conn.cursor()

    c.executescript('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS media (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_name TEXT UNIQUE NOT NULL,
            url_or_base64 TEXT
        );

        CREATE TABLE IF NOT EXISTS features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER DEFAULT 0,
            url TEXT,
            title TEXT
        );

        CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER DEFAULT 0,
            icon TEXT,
            label TEXT
        );

        CREATE TABLE IF NOT EXISTS comm_buttons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sort_order INTEGER DEFAULT 0,
            type TEXT,
            href TEXT,
            label TEXT,
            title TEXT,
            target TEXT
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            title_ar TEXT NOT NULL,
            title_en TEXT,
            description_ar TEXT,
            description_en TEXT,
            video_url TEXT,
            thumbnail_url TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS comm_config (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    ''')

    # Default settings
    c.execute("SELECT COUNT(*) FROM settings")
    if c.fetchone()[0] == 0:
        c.executemany(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            [('comm_position', 'left'), ('comm_vertical', 'bottom')]
        )

    # Seed default projects (app design, servers, websites)
    c.execute("SELECT COUNT(*) FROM projects")
    if c.fetchone()[0] == 0:
        defaults = [
            ('app_design', 'تصميم التطبيقات', 'App Design',
             'دليل شامل لتصميم تطبيقات جوال وويب احترافية. نغطي واجهة المستخدم، تجربة المستخدم، والتكامل مع السيرفرات.',
             'Complete guide to designing professional mobile and web apps. We cover UI, UX, and server integration.',
             'https://www.youtube.com/embed/dQw4w9WgXcQ', 'assets/6-digital-interface.png', 0),
            ('app_design', 'واجهات المستخدم', 'User Interfaces',
             'أساسيات تصميم الواجهات التفاعلية. الألوان، الخطوط، والتناسق البصري.',
             'Basics of interactive interface design. Colors, fonts, and visual harmony.',
             None, 'assets/4-access-control.png', 1),
            ('servers', 'إنشاء السيرفرات', 'Server Creation',
             'خطوات إنشاء وإعداد خوادم احترافية. تثبيت نظام التشغيل، ضبط الأمان، واستضافة التطبيقات.',
             'Steps to create and configure professional servers. OS installation, security hardening, and app hosting.',
             'https://www.youtube.com/embed/dQw4w9WgXcQ', 'assets/6-digital-interface.png', 0),
            ('servers', 'غرف السيرفرات', 'Server Rooms',
             'تصميم وتجهيز غرف الخوادم: التبريد، الطاقة، والكابلات.',
             'Design and setup of server rooms: cooling, power, and cabling.',
             None, 'assets/6-digital-interface.png', 1),
            ('websites', 'إنشاء المواقع', 'Website Creation',
             'من الصفر إلى النشر: بناء مواقع احترافية متجاوبة مع أحدث التقنيات.',
             'From zero to deploy: building responsive professional websites with latest technologies.',
             'https://www.youtube.com/embed/dQw4w9WgXcQ', 'assets/5-iot-smart-home.png', 0),
            ('websites', 'السيرفرات والاستضافة', 'Hosting & Servers',
             'استضافة المواقع على خوادم آمنة وسريعة. نصائح لتحسين الأداء.',
             'Hosting websites on secure and fast servers. Performance optimization tips.',
             None, 'assets/8-antenna.png', 1),
        ]
        c.executemany(
            '''INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            defaults
        )

    # Seed default features
    c.execute("SELECT COUNT(*) FROM features")
    if c.fetchone()[0] == 0:
        defaults = [
            ('https://images.unsplash.com/photo-1551434678-e076c223a692?w=600', 'جودة التركيب وكفاءة الأداء'),
            ('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600', 'هوائيات محسنة لتجربة إنترنت استثنائية'),
            ('https://images.unsplash.com/photo-1518770660439-4636190af475?w=600', 'سنوات من الخبرة في مد جسور الاتصال')
        ]
        for i, (url, title) in enumerate(defaults):
            c.execute("INSERT INTO features (sort_order, url, title) VALUES (?, ?, ?)", (i, url, title))

    # Seed default tools
    c.execute("SELECT COUNT(*) FROM tools")
    if c.fetchone()[0] == 0:
        for i, (icon, label) in enumerate([('📶', 'شبكات الإنترنت'), ('📡', 'هوائيات محسنة'), ('🔒', 'أنظمة الأمان'), ('🏠', 'المباني الذكية')]):
            c.execute("INSERT INTO tools (sort_order, icon, label) VALUES (?, ?, ?)", (i, icon, label))

    # Seed default comm buttons
    c.execute("SELECT COUNT(*) FROM comm_buttons")
    if c.fetchone()[0] == 0:
        defaults = [
            ('phone', 'tel:+22247774141', 'اتصل', '0022247774141', ''),
            ('whatsapp', 'https://wa.me/22247774141', 'واتساب', '0022247774141', '_blank'),
            ('email', 'mailto:Itnord@outlook.fr', 'بريد', 'البريد الإلكتروني', ''),
        ]
        for i, (t, h, l, tit, tg) in enumerate(defaults):
            c.execute("INSERT INTO comm_buttons (sort_order, type, href, label, title, target) VALUES (?, ?, ?, ?, ?, ?)", (i, t, h, l, tit, tg))

    conn.commit()
    conn.close()


# --- API: Settings & Media ---

@app.route('/api/settings', methods=['GET'])
def get_settings():
    conn = get_db()
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    conn.close()
    return jsonify(dict(rows))


@app.route('/api/media', methods=['GET'])
def get_media():
    conn = get_db()
    rows = conn.execute("SELECT key_name, url_or_base64 FROM media").fetchall()
    conn.close()
    return jsonify(dict(rows))


@app.route('/api/media', methods=['POST'])
def save_media():
    data = request.json or {}
    conn = get_db()
    for k, v in data.items():
        conn.execute(
            "INSERT OR REPLACE INTO media (key_name, url_or_base64) VALUES (?, ?)",
            (k, v or '')
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# --- API: Features ---

@app.route('/api/features', methods=['GET'])
def get_features():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, url, title, sort_order FROM features ORDER BY sort_order, id"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/features', methods=['POST'])
def save_features():
    items = request.json or []
    conn = get_db()
    conn.execute("DELETE FROM features")
    for i, f in enumerate(items):
        conn.execute(
            "INSERT INTO features (sort_order, url, title) VALUES (?, ?, ?)",
            (i, f.get('url') or '', f.get('title') or '')
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# --- API: Tools ---

@app.route('/api/tools', methods=['GET'])
def get_tools():
    conn = get_db()
    rows = conn.execute(
        "SELECT id, icon, label, sort_order FROM tools ORDER BY sort_order, id"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/tools', methods=['POST'])
def save_tools():
    items = request.json or []
    conn = get_db()
    conn.execute("DELETE FROM tools")
    for i, t in enumerate(items):
        conn.execute(
            "INSERT INTO tools (sort_order, icon, label) VALUES (?, ?, ?)",
            (i, t.get('icon') or '', t.get('label') or '')
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# --- API: Communication buttons ---

@app.route('/api/comm', methods=['GET'])
def get_comm():
    conn = get_db()
    config_rows = conn.execute("SELECT key, value FROM comm_config").fetchall()
    config = dict(config_rows)
    rows = conn.execute(
        "SELECT id, type, href, label, title, target FROM comm_buttons ORDER BY sort_order, id"
    ).fetchall()
    conn.close()
    # Fallback defaults
    if not rows:
        defaults = [
            {'type': 'phone', 'href': 'tel:+22247774141', 'label': 'اتصل', 'title': '0022247774141', 'target': ''},
            {'type': 'whatsapp', 'href': 'https://wa.me/22247774141', 'label': 'واتساب', 'title': '0022247774141', 'target': '_blank'},
            {'type': 'email', 'href': 'mailto:Itnord@outlook.fr', 'label': 'بريد', 'title': 'البريد الإلكتروني', 'target': ''},
        ]
        return jsonify({'config': config, 'buttons': defaults})
    return jsonify({'config': config, 'buttons': [dict(r) for r in rows]})


@app.route('/api/comm', methods=['POST'])
def save_comm():
    data = request.json or {}
    config = data.get('config', {})
    buttons = data.get('buttons', [])
    conn = get_db()
    for k, v in config.items():
        conn.execute(
            "INSERT OR REPLACE INTO comm_config (key, value) VALUES (?, ?)",
            (k, str(v))
        )
    conn.execute("DELETE FROM comm_buttons")
    for i, b in enumerate(buttons):
        conn.execute(
            "INSERT INTO comm_buttons (sort_order, type, href, label, title, target) VALUES (?, ?, ?, ?, ?, ?)",
            (i, b.get('type', 'phone'), b.get('href', '#'), b.get('label', ''), b.get('title', ''), b.get('target', '') or '')
        )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# --- API: Projects ---

@app.route('/api/projects', methods=['GET'])
def list_projects():
    category = request.args.get('category')
    conn = get_db()
    if category:
        rows = conn.execute(
            "SELECT id, category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, sort_order FROM projects WHERE category = ? ORDER BY sort_order, id",
            (category,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, sort_order FROM projects ORDER BY category, sort_order, id"
        ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route('/api/projects/<int:pid>', methods=['GET'])
def get_project(pid):
    conn = get_db()
    row = conn.execute(
        "SELECT id, category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url FROM projects WHERE id = ?",
        (pid,)
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict(row))


@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json or {}
    conn = get_db()
    c = conn.cursor()
    c.execute(
        """INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data.get('category', 'other'),
            data.get('title_ar', ''),
            data.get('title_en', ''),
            data.get('description_ar', ''),
            data.get('description_en', ''),
            data.get('video_url', ''),
            data.get('thumbnail_url', ''),
            data.get('sort_order', 0)
        )
    )
    pid = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'ok': True, 'id': pid})


@app.route('/api/projects/<int:pid>', methods=['PUT'])
def update_project(pid):
    data = request.json or {}
    conn = get_db()
    conn.execute(
        """UPDATE projects SET category=?, title_ar=?, title_en=?, description_ar=?, description_en=?, video_url=?, thumbnail_url=?, sort_order=? WHERE id=?""",
        (
            data.get('category', 'other'),
            data.get('title_ar', ''),
            data.get('title_en', ''),
            data.get('description_ar', ''),
            data.get('description_en', ''),
            data.get('video_url', ''),
            data.get('thumbnail_url', ''),
            data.get('sort_order', 0),
            pid
        )
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/projects/<int:pid>', methods=['DELETE'])
def delete_project(pid):
    conn = get_db()
    conn.execute("DELETE FROM projects WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# --- Static files & HTML ---

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/admin')
@app.route('/admin/')
def admin():
    return send_from_directory('.', 'admin.html')


@app.route('/project/<int:pid>')
def project_page(pid):
    return send_from_directory('.', 'project.html')


@app.route('/<path:path>')
def static_file(path):
    return send_from_directory('.', path)


if __name__ == '__main__':
    init_db()
    print('Database initialized. Visit http://127.0.0.1:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
