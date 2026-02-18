# -*- coding: utf-8 -*-
"""إصلاح المشاريع المفقودة - تشغيل: python seed_projects.py"""

import sqlite3
from pathlib import Path

DB = Path(__file__).parent / 'data' / 'itnord.db'
DB.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB)
c = conn.cursor()

# Add gallery_images column if missing
try:
    c.execute("ALTER TABLE projects ADD COLUMN gallery_images TEXT")
except sqlite3.OperationalError:
    pass

# Projects 7-12
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

for row in extras:
    cat = row[0]
    c.execute("SELECT id FROM projects WHERE category = ?", (cat,))
    if c.fetchone() is None:
        c.execute(
            '''INSERT INTO projects (category, title_ar, title_en, description_ar, description_en, video_url, thumbnail_url, gallery_images, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            row
        )
        print(f'تمت إضافة: {row[1]}')

conn.commit()
conn.close()
print('تم.')
print('شغّل الخادم: python app.py')
