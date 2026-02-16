# -*- coding: utf-8 -*-
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update email
html = html.replace('info@itnord.com', 'Itnord@outlook.fr')

# 2. Remove network-contact-box from services
old_box = '''        <div class="network-contact-box">
            <p><strong>للتواصل:</strong> هاتف و واتساب <a href="tel:+22247774141">0022247774141</a></p>
        </div>
        '''
html = html.replace(old_box, '')

# 3. Add Smart Buildings slide before closing </div></div> of carousel
smart_slide = '''                <div class="dim-slide-card">
                    <img src="assets/10-smart-buildings.png" alt="المباني الذكية">
                    <div class="dim-slide-summary">
                        <h3>المباني الذكية</h3>
                        <p>حلول التيار الخفيف والاتصالات للمباني الذكية: نوفر أساساً تكنولوجياً متيناً لمنشآتك.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Business Summary -->
'''
# Find the closing of the last dim-slide-card (smart heating)
old_carousel_end = '''                </div>
            </div>
        </div>
    </section>

    <!-- Business Summary -->
'''
# The last slide ends with smart-heating, we need to add our slide before the closing divs
old_end = '''                <div class="dim-slide-card">
                    <img src="assets/9-smart-heating.png" alt="تسخين ذكي">
                    <div class="dim-slide-summary">
                        <h3>أنظمة التسخين الذكية</h3>
                        <p>منظمات حرارة لاسلكية لكل منطقة. وضع اقتصاد ووضع راحة وبرمجة يومية وأسبوعية لتوفير الطاقة.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Business Summary -->
'''
new_end = '''                <div class="dim-slide-card">
                    <img src="assets/9-smart-heating.png" alt="تسخين ذكي">
                    <div class="dim-slide-summary">
                        <h3>أنظمة التسخين الذكية</h3>
                        <p>منظمات حرارة لاسلكية لكل منطقة. وضع اقتصاد ووضع راحة وبرمجة يومية وأسبوعية لتوفير الطاقة.</p>
                    </div>
                </div>
                <div class="dim-slide-card">
                    <img src="assets/10-smart-buildings.png" alt="المباني الذكية">
                    <div class="dim-slide-summary">
                        <h3>المباني الذكية</h3>
                        <p>حلول التيار الخفيف والاتصالات للمباني الذكية: نوفر أساساً تكنولوجياً متيناً لمنشآتك.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Business Summary -->
'''
html = html.replace(old_end, new_end)

# 4. Add bottom contact bar before footer
old_footer = '''    </div>

    <footer class="footer">
'''
new_footer = '''    </div>

    <!-- Bottom Contact Bar -->
    <div class="bottom-contact-bar">
        <a href="tel:+22247774141" class="bottom-contact-item">0022247774141</a>
        <a href="https://wa.me/22247774141" target="_blank" class="bottom-contact-item">واتساب</a>
        <a href="mailto:Itnord@outlook.fr" class="bottom-contact-item">Itnord@outlook.fr</a>
    </div>

    <footer class="footer">
'''
html = html.replace(old_footer, new_footer)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done')
