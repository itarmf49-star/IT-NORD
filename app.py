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
            gallery_images TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS comm_config (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    ''')

    try:
        c.execute("ALTER TABLE projects ADD COLUMN gallery_images TEXT")
    except sqlite3.OperationalError:
        pass

    # Default settings
    c.execute("SELECT COUNT(*) FROM settings")
    if c.fetchone()[0] == 0:
        c.executemany(
            "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
            [('comm_position', 'left'), ('comm_vertical', 'bottom')]
        )

    # Seed default projects with advertising/educational videos
    c.execute("SELECT COUNT(*) FROM projects")
    if c.fetchone()[0] == 0:
        # Video IDs: App design (Figma/UI), Server setup, Web dev (freeCodeCamp)
        defaults = [
            ('app_design', 'تصميم التطبيقات', 'App Design',
             'دليل شامل لتصميم تطبيقات جوال وويب احترافية. نغطي واجهة المستخدم، تجربة المستخدم، والتكامل مع السيرفرات.',
             'Complete guide to designing professional mobile and web apps. We cover UI, UX, and server integration.',
             'https://www.youtube.com/embed/R6OD07X_2aI', 'assets/6-digital-interface.png', 0),
            ('app_design', 'واجهات المستخدم', 'User Interfaces',
             'أساسيات تصميم الواجهات التفاعلية. الألوان، الخطوط، والتناسق البصري.',
             'Basics of interactive interface design. Colors, fonts, and visual harmony.',
             'https://www.youtube.com/embed/6VQEoH5zMIw', 'assets/4-access-control.png', 1),
            ('servers', 'إنشاء السيرفرات', 'Server Creation',
             'خطوات إنشاء وإعداد خوادم احترافية. تثبيت نظام التشغيل، ضبط الأمان، واستضافة التطبيقات.',
             'Steps to create and configure professional servers. OS installation, security hardening, and app hosting.',
             'https://www.youtube.com/embed/n2v0Jv7pRp8', 'assets/6-digital-interface.png', 0),
            ('servers', 'غرف السيرفرات', 'Server Rooms',
             'تصميم وتجهيز غرف الخوادم: التبريد، الطاقة، والكابلات.',
             'Design and setup of server rooms: cooling, power, and cabling.',
             'https://www.youtube.com/embed/5q2zz1Syw8g', 'assets/6-digital-interface.png', 1),
            ('websites', 'إنشاء المواقع', 'Website Creation',
             'من الصفر إلى النشر: بناء مواقع احترافية متجاوبة مع أحدث التقنيات.',
             'From zero to deploy: building responsive professional websites with latest technologies.',
             'https://www.youtube.com/embed/8pDqJVdNa44', 'assets/5-iot-smart-home.png', 0),
            ('websites', 'السيرفرات والاستضافة', 'Hosting & Servers',
             'استضافة المواقع على خوادم آمنة وسريعة. نصائح لتحسين الأداء.',
             'Hosting websites on secure and fast servers. Performance optimization tips.',
             'https://www.youtube.com/embed/09TeUXjzpKs', 'assets/8-antenna.png', 1),
        ]
        c.executemany(
            '''INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, gallery_images, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            [
                ('app_design', 'تصميم التطبيقات', 'App Design',
                 'دليل شامل لتصميم تطبيقات جوال وويب احترافية. نغطي واجهة المستخدم، تجربة المستخدم، والتكامل مع السيرفرات.',
                 'Complete guide to designing professional mobile and web apps. We cover UI, UX, and server integration.',
                 'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/6-digital-interface.png',
                 '["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600","https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]', 0),
                ('app_design', 'واجهات المستخدم', 'User Interfaces',
                 'أساسيات تصميم الواجهات التفاعلية. الألوان، الخطوط، والتناسق البصري.',
                 'Basics of interactive interface design. Colors, fonts, and visual harmony.',
                 'https://www.youtube-nocookie.com/embed/6VQEoH5zMIw', 'assets/4-access-control.png',
                 '["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600","https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600"]', 1),
                ('servers', 'إنشاء السيرفرات', 'Server Creation',
                 'خطوات إنشاء وإعداد خوادم احترافية. تثبيت نظام التشغيل، ضبط الأمان، واستضافة التطبيقات.',
                 'Steps to create and configure professional servers. OS installation, security hardening, and app hosting.',
                 'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/6-digital-interface.png',
                 '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600","https://images.unsplash.com/photo-1497366216548-37526070297c?w=600"]', 0),
                ('servers', 'غرف السيرفرات', 'Server Rooms',
                 'تصميم وتجهيز غرف الخوادم: التبريد، الطاقة، والكابلات.',
                 'Design and setup of server rooms: cooling, power, and cabling.',
                 'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/6-digital-interface.png',
                 '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600","https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600"]', 1),
                ('websites', 'إنشاء المواقع', 'Website Creation',
                 'من الصفر إلى النشر: بناء مواقع احترافية متجاوبة مع أحدث التقنيات.',
                 'From zero to deploy: building responsive professional websites with latest technologies.',
                 'https://www.youtube-nocookie.com/embed/8pDqJVdNa44', 'assets/5-iot-smart-home.png',
                 '["https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600","https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"]', 0),
                ('websites', 'السيرفرات والاستضافة', 'Hosting & Servers',
                 'استضافة المواقع على خوادم آمنة وسريعة. نصائح لتحسين الأداء.',
                 'Hosting websites on secure and fast servers. Performance optimization tips.',
                 'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/8-antenna.png',
                 '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"]', 1),
            ]
        )
        extras = [
            ('antennas', 'الهوائيات والاتصال', 'Antennas & Connectivity',
             'هوائيات احترافية لتحسين تجربة الإنترنت وربط المواقع عبر جسور اتصال لاسلكية بعيدة المدى.',
             'Professional antennas for better internet and wireless bridges.',
             'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/8-antenna.png',
             '["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600","https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600","https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"]', 7),
            ('networks', 'خدمات الشبكات', 'Network Services',
             'تصميم وتنفيذ شبكات الإنترنت والواي فاي. توزيع إشارة ذكي يغطي كل زوايا المبنى.',
             'Design and implementation of internet and Wi-Fi networks.',
             'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/4-access-control.png',
             '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]', 8),
            ('cameras', 'كاميرات المراقبة والأمان', 'Surveillance & Security',
             'تركيب أحدث أنظمة كاميرات المراقبة لضمان حماية المنشآت والعائلات ومراقبتها عن بعد.',
             'Installation of advanced surveillance systems for 24/7 protection.',
             'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/1-ptz-camera.png',
             '["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600","https://images.unsplash.com/photo-1558002038-10559092b84b?w=600","https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600"]', 9),
            ('smart_buildings', 'المباني الذكية', 'Smart Buildings',
             'أتمتة المباني وإنترنت الأشياء. تحويل المباني العادية إلى مباني ذكية.',
             'Building automation and IoT for smart infrastructure.',
             'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/5-iot-smart-home.png',
             '["https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600","https://images.unsplash.com/photo-1558002038-10559092b84b?w=600"]', 10),
            ('integrated', 'الحلول المتكاملة', 'Integrated Solutions',
             'حلول متكاملة لبيئة متصلة وذكية. ربط الشبكات والأمان والتقنية في نظام واحد.',
             'Integrated solutions for connected smart environments.',
             'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/5-iot-smart-home.png',
             '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]', 11),
            ('digital', 'الخيال الرقمي', 'Digital Imagination',
             'حلول تفاعلية تجمع الكاميرات، السحابة، الشبكة والموقع. واجهات متقدمة لإدارة الأنظمة.',
             'Interactive solutions combining cameras, cloud, network. Advanced control interfaces.',
             'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/6-digital-interface.png',
             '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600"]', 12),
        ]
        c.executemany(
            '''INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, gallery_images, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            extras
        )
    else:
        # Migration: add gallery_images for existing projects by category
        gallery_by_cat = {
            'app_design': '["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600","https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]',
            'servers': '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600"]',
            'websites': '["https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600","https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"]',
            'antennas': '["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600","https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600"]',
            'networks': '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600"]',
            'cameras': '["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600","https://images.unsplash.com/photo-1558002038-10559092b84b?w=600"]',
            'smart_buildings': '["https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600"]',
            'integrated': '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]',
            'digital': '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600"]',
        }
        for cat, gall in gallery_by_cat.items():
            c.execute("UPDATE projects SET gallery_images = ? WHERE category = ? AND (gallery_images IS NULL OR gallery_images = '')", (gall, cat))
        # Migration: add new project types if missing (projects 7-12)
        c.execute("SELECT COUNT(*) FROM projects WHERE category IN ('antennas','networks','cameras','smart_buildings','integrated','digital')")
        if c.fetchone()[0] == 0:
            extras = [
                ('antennas', 'الهوائيات والاتصال', 'Antennas & Connectivity',
                 'هوائيات احترافية لتحسين تجربة الإنترنت وربط المواقع عبر جسور اتصال لاسلكية بعيدة المدى.',
                 'Professional antennas for better internet and wireless bridges.',
                 'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/8-antenna.png',
                 '["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600","https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600","https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"]', 7),
                ('networks', 'خدمات الشبكات', 'Network Services',
                 'تصميم وتنفيذ شبكات الإنترنت والواي فاي. توزيع إشارة ذكي يغطي كل زوايا المبنى.',
                 'Design and implementation of internet and Wi-Fi networks.',
                 'https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8', 'assets/4-access-control.png',
                 '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]', 8),
                ('cameras', 'كاميرات المراقبة والأمان', 'Surveillance & Security',
                 'تركيب أحدث أنظمة كاميرات المراقبة لضمان حماية المنشآت والعائلات ومراقبتها عن بعد.',
                 'Installation of advanced surveillance systems for 24/7 protection.',
                 'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/1-ptz-camera.png',
                 '["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600","https://images.unsplash.com/photo-1558002038-10559092b84b?w=600"]', 9),
                ('smart_buildings', 'المباني الذكية', 'Smart Buildings',
                 'أتمتة المباني وإنترنت الأشياء. تحويل المباني العادية إلى مباني ذكية.',
                 'Building automation and IoT for smart infrastructure.',
                 'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/5-iot-smart-home.png',
                 '["https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600","https://images.unsplash.com/photo-1558002038-10559092b84b?w=600"]', 10),
                ('integrated', 'الحلول المتكاملة', 'Integrated Solutions',
                 'حلول متكاملة لبيئة متصلة وذكية. ربط الشبكات والأمان والتقنية في نظام واحد.',
                 'Integrated solutions for connected smart environments.',
                 'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/5-iot-smart-home.png',
                 '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600","https://images.unsplash.com/photo-1551434678-e076c223a692?w=600"]', 11),
                ('digital', 'الخيال الرقمي', 'Digital Imagination',
                 'حلول تفاعلية تجمع الكاميرات، السحابة، الشبكة والموقع. واجهات متقدمة لإدارة الأنظمة.',
                 'Interactive solutions combining cameras, cloud, network.',
                 'https://www.youtube-nocookie.com/embed/D6Ac5JpCHmI', 'assets/6-digital-interface.png',
                 '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600"]', 12),
            ]
            c.executemany(
                '''INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, gallery_images, sort_order)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                extras
            )
        # Migration: update placeholder videos
        video_updates = [
            (1, 'https://www.youtube.com/embed/R6OD07X_2aI'),   # App design
            (2, 'https://www.youtube.com/embed/6VQEoH5zMIw'),   # User interfaces
            (3, 'https://www.youtube.com/embed/n2v0Jv7pRp8'),   # Server creation
            (4, 'https://www.youtube.com/embed/5q2zz1Syw8g'),   # Server rooms
            (5, 'https://www.youtube.com/embed/8pDqJVdNa44'),   # Website creation
            (6, 'https://www.youtube.com/embed/09TeUXjzpKs'),   # Hosting
        ]
        for pid, url in video_updates:
            c.execute("UPDATE projects SET video_url = ? WHERE id = ? AND (video_url IS NULL OR video_url = '' OR video_url LIKE '%dQw4w9WgXcQ%')", (url, pid))

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
        "SELECT id, category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, gallery_images FROM projects WHERE id = ?",
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


# Initialize database when module is imported (for Vercel/serverless)
if not os.environ.get('SKIP_INIT_DB'):
    try:
        init_db()
    except Exception as e:
        print(f'Database init warning: {e}')

if __name__ == '__main__':
    print('Database initialized. Visit http://127.0.0.1:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
