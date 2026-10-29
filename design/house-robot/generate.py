# Helper robot character sheet: faceless round home robot that "speaks" through its light ring and projected icons.
import math

OUT = '/home/user/oya-agent-agent/design/house-robot/robot-sheet.html'
uid = [0]


def nid(p):
    uid[0] += 1
    return '%s%d' % (p, uid[0])


SKINS = {
    'classic': dict(top1='#ffffff', top2='#e9edf0', side1='#f4f6f8', side2='#c3ccd4', band='#14a39b', band2='#0b7570', btn='#14a39b', name='الكلاسيكي'),
    'navy':    dict(top1='#3c5a86', top2='#1d3557', side1='#2c4670', side2='#12233d', band='#e7b44a', band2='#a77a1c', btn='#e7b44a', name='الكحلي الذهبي'),
    'coral':   dict(top1='#ffd9cc', top2='#ffb39c', side1='#ffc6b3', side2='#d9806a', band='#ffffff', band2='#d9d0cc', btn='#ff7a59', name='المرجاني'),
    'mint':    dict(top1='#e6fff4', top2='#b8ecd6', side1='#cdf5e4', side2='#86c7aa', band='#2f6f5a', band2='#1d4a3b', btn='#2f9b7a', name='النعناعي'),
    'wood':    dict(top1='#f6efe4', top2='#e3d4bd', side1='#c08a55', side2='#7d5230', band='#3b2a1d', band2='#22170f', btn='#c08a55', name='خشب الجوز'),
    'brass':   dict(top1='#f3dc9b', top2='#c9a24a', side1='#d9b764', side2='#8a6a22', band='#3a2f22', band2='#1f1912', btn='#8a6a22', name='النحاسي العتيق'),
}

ICONS = {
    'check': '<path d="M-9 0 L-3 6 L9 -7" fill="none" stroke="%s" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
    'bulb': '<path d="M-6 4 a8.5 8.5 0 1 1 12 0 c-1.6 1.5-2 3-2 4.5 h-8 c0-1.5-.4-3-2-4.5z" fill="%s"/><rect x="-4" y="10" width="8" height="3" rx="1.5" fill="%s"/>',
    'dots': '<circle cx="-8" cy="0" r="3" fill="%s"/><circle cx="0" cy="0" r="3" fill="%s" opacity=".7"/><circle cx="8" cy="0" r="3" fill="%s" opacity=".4"/>',
    'bang': '<rect x="-2.5" y="-11" width="5" height="14" rx="2.5" fill="%s"/><circle cx="0" cy="8" r="3" fill="%s"/>',
    'battery': '<rect x="-11" y="-6" width="20" height="12" rx="3" fill="none" stroke="%s" stroke-width="2.6"/><rect x="10" y="-2.5" width="3" height="5" rx="1" fill="%s"/><path d="M-1 -4 L-5 1 H0 L-2 5 L3 -1 H-2z" fill="%s"/>',
    'star': '<polygon points="0,-11 3.2,-3.5 11,-3.4 4.8,1.6 7,9.5 0,5 -7,9.5 -4.8,1.6 -11,-3.4 -3.2,-3.5" fill="%s"/>',
    'house': '<path d="M-10 1 L0 -9 L10 1 M-7 -1 V9 H7 V-1" fill="none" stroke="%s" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    'drop': '<path d="M0 -11 C6 -3 8 1 8 4 a8 8 0 0 1 -16 0 c0-3 2-7 8-15z" fill="%s"/>',
}


def icon(name, col):
    t = ICONS[name]
    return t % tuple([col] * t.count('%s'))


def tool(name, x, y, s=1.0):
    g = {
        'brush': '<rect x="-3" y="-18" width="6" height="16" rx="2" fill="#c08a55"/><rect x="-9" y="-3" width="18" height="7" rx="2" fill="#3b4a5a"/>' + ''.join('<line x1="%d" y1="4" x2="%d" y2="13" stroke="#e7c27a" stroke-width="2"/>' % (i, i) for i in range(-7, 9, 3)),
        'sponge': '<rect x="-11" y="-8" width="22" height="16" rx="5" fill="#ffd34d"/><rect x="-11" y="2" width="22" height="6" rx="3" fill="#2f9b7a"/>' + ''.join('<circle cx="%d" cy="%d" r="1.4" fill="#e0a800"/>' % (cx, cy) for cx, cy in [(-6, -4), (0, -2), (5, -5), (-2, -6)]),
        'screw': '<rect x="-4" y="-18" width="8" height="12" rx="3" fill="#ff7a59"/><rect x="-1.5" y="-6" width="3" height="16" fill="#a9b6c2"/><path d="M-3 10 L3 10 L0 15z" fill="#7d8b98"/>',
        'roller': '<rect x="-12" y="-14" width="24" height="10" rx="5" fill="#6aa9e9"/><path d="M0 -4 V4 H-6 V14" fill="none" stroke="#7d8b98" stroke-width="2.5"/><rect x="-9" y="12" width="6" height="8" rx="2" fill="#3b4a5a"/>',
        'spray': '<rect x="-7" y="-6" width="14" height="20" rx="4" fill="#14a39b"/><rect x="-4" y="-12" width="10" height="7" rx="2" fill="#3b4a5a"/><circle cx="-12" cy="-10" r="1.6" fill="#9fdcff"/><circle cx="-16" cy="-6" r="1.3" fill="#9fdcff"/><circle cx="-15" cy="-13" r="1.2" fill="#9fdcff"/>',
        'lens': '<circle cx="-2" cy="-3" r="9" fill="#dff3ff" stroke="#3b4a5a" stroke-width="3"/><circle cx="-5" cy="-6" r="3" fill="#fff"/><rect x="4" y="5" width="5" height="12" rx="2" fill="#3b4a5a" transform="rotate(-40 6 10)"/>',
        'wrench': '<path d="M-3 -16 a7 7 0 1 0 6 0 v6 h-6z" fill="#a9b6c2"/><rect x="-3" y="-8" width="6" height="22" rx="2" fill="#a9b6c2"/><rect x="-3" y="4" width="6" height="10" rx="2" fill="#3b4a5a"/>',
        'vacuum': '<rect x="-3" y="-18" width="6" height="18" rx="2" fill="#7d8b98"/><path d="M-12 0 H12 L9 8 H-9z" fill="#3b4a5a"/><rect x="-10" y="7" width="20" height="3" rx="1.5" fill="#14a39b"/>',
    }[name]
    return '<g transform="translate(%.1f %.1f) scale(%s)">%s</g>' % (x, y, s, g)


def robot(cx, cy, s=1.0, skin='classic', ring='#3fe0d0', mode='full', tilt=0, ic=None, ic_col=None, arm=None, glow=1.0, hop=0):
    k = SKINS[skin]
    R, ry, h = 70 * s, 28 * s, 30 * s
    gt, gs, gl, gb = nid('rt'), nid('rs'), nid('rg'), nid('rb')
    o = []
    o.append('<defs><radialGradient id="%s" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></radialGradient>'
             '<linearGradient id="%s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="%s"/><stop offset=".35" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
             '<linearGradient id="%s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="%s"/><stop offset=".4" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
             '<filter id="%s" x="-50%%" y="-80%%" width="200%%" height="260%%"><feGaussianBlur stdDeviation="%s"/></filter></defs>'
             % (gt, k['top1'], k['top2'], gs, k['side2'], k['side1'], k['side2'], gb, k['band2'], k['band'], k['band2'], gl, 5 * s))
    base_y = cy + h
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#0b1c2c" opacity="%.2f" filter="url(#soft)"/>' % (cx, base_y + 6 * s + hop, R * (1.02 - hop / 200), ry * 1.05, .28 - hop / 300))
    o.append('<g transform="translate(0 %.1f) rotate(%s %.1f %.1f)">' % (-hop, tilt, cx, cy + h / 2))
    # wheels + side brush
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#1f2a35"/>' % (cx, base_y + 2 * s, R * .92, ry * .9))
    sbx, sby = cx - R * .72, base_y + 6 * s
    o.append('<g opacity=".85">' + ''.join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#566574" stroke-width="%.1f" stroke-linecap="round"/>' % (sbx, sby, sbx + math.cos(a) * 16 * s, sby + math.sin(a) * 6 * s, 1.6 * s) for a in [0.3, 1.9, 3.5, 5.1]) + '</g>')
    # side wall
    o.append('<path d="M%.1f %.1f V%.1f A%.1f %.1f 0 0 0 %.1f %.1f V%.1f Z" fill="url(#%s)"/>' % (cx - R, cy, base_y, R, ry, cx + R, base_y, cy, gs))
    # bumper band
    o.append('<path d="M%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f V%.1f A%.1f %.1f 0 0 1 %.1f %.1f Z" fill="url(#%s)"/>'
             % (cx - R, cy + h * .45, R, ry, cx + R, cy + h * .45, cy + h * .78, R, ry, cx - R, cy + h * .78, gb))
    # vents on front
    for i in range(-2, 3):
        o.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#000" opacity=".16"/>' % (cx + i * 9 * s - 2.5 * s, cy + h * .9 + ry - 2 * s, 5 * s, 2.4 * s, 1.2 * s))
    # top
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="url(#%s)" stroke="%s" stroke-width="%.1f"/>' % (cx, cy, R, ry, gt, k['side2'], 1.2 * s))
    # light ring
    rr, rry = R * .8, ry * .8
    if mode == 'off':
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="#8b98a5" stroke-width="%.1f" opacity=".5"/>' % (cx, cy, rr, rry, 4 * s))
    else:
        dash = ''
        if mode == 'seg':
            dash = 'stroke-dasharray="%.1f %.1f"' % (14 * s, 10 * s)
        elif mode == 'half':
            dash = 'stroke-dasharray="%.1f %.1f" stroke-dashoffset="%.1f"' % (math.pi * rr * .9, math.pi * rr * 1.2, -math.pi * rr * .2)
        if mode == 'rainbow':
            cols = ['#ff6b6b', '#ffb84d', '#ffe14d', '#5fe08a', '#4dc3ff', '#9b7bff']
            per = 2 * math.pi * math.sqrt((rr * rr + rry * rry) / 2)
            for i, c in enumerate(cols):
                o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="%s" stroke-width="%.1f" stroke-dasharray="%.1f %.1f" stroke-dashoffset="%.1f" filter="url(#%s)" opacity=".9"/>' % (cx, cy, rr, rry, c, 9 * s, per / 6, per * 5 / 6, -i * per / 6, gl))
                o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="%s" stroke-width="%.1f" stroke-dasharray="%.1f %.1f" stroke-dashoffset="%.1f"/>' % (cx, cy, rr, rry, c, 4 * s, per / 6, per * 5 / 6, -i * per / 6))
        else:
            o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="%s" stroke-width="%.1f" %s filter="url(#%s)" opacity="%.2f"/>' % (cx, cy, rr, rry, ring, 10 * s, dash, gl, .9 * glow))
            o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="%s" stroke-width="%.1f" %s/>' % (cx, cy, rr, rry, ring, 4 * s, dash))
            o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="#fff" stroke-width="%.1f" %s opacity=".7"/>' % (cx, cy, rr, rry, 1.4 * s, dash))
    # centre button with house emblem
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s"/>' % (cx, cy + 3 * s, R * .3, ry * .32, k['side2']))
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s"/>' % (cx, cy, R * .3, ry * .32, k['btn']))
    o.append('<g transform="translate(%.1f %.1f) scale(%.2f %.2f)">%s</g>' % (cx, cy, .62 * s, .3 * s, icon('house', '#ffffff')))
    # gloss
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#fff" opacity=".55"/>' % (cx - R * .45, cy - ry * .45, R * .28, ry * .16))
    # arm + tool
    if arm:
        ax, ay = cx + R * .92, cy + h * .35
        ex, ey = ax + 30 * s, ay - 34 * s
        tx, ty = ex + 18 * s, ey - 18 * s
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f" fill="none" stroke="#7d8b98" stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"/>' % (ax, ay, ex, ey, tx, ty, 7 * s))
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f" fill="none" stroke="#c7d1da" stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"/>' % (ax, ay - 1.5 * s, ex, ey - 1.5 * s, tx, ty - 1.5 * s, 2.4 * s))
        for jx, jy in [(ax, ay), (ex, ey)]:
            o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" stroke="#3b4a5a" stroke-width="%.1f"/>' % (jx, jy, 5.5 * s, k['band'], 1.2 * s))
        o.append(tool(arm, tx + 6 * s, ty - 12 * s, s))
    o.append('</g>')
    # projected icon bubble
    if ic:
        bx, by = cx, cy - 92 * s - hop
        col = ic_col or ring
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="%s" opacity=".18"/>' % (cx - 12 * s, cy - hop, cx + 12 * s, cy - hop, bx + 24 * s, by + 16 * s, bx - 24 * s, by + 16 * s, col))
        o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" opacity=".35" filter="url(#%s)"/>' % (bx, by, 30 * s, col, gl))
        o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#ffffff" fill-opacity=".92" stroke="%s" stroke-width="%.1f"/>' % (bx, by, 24 * s, col, 3 * s))
        o.append('<g transform="translate(%.1f %.1f) scale(%.2f)">%s</g>' % (bx, by, 1.1 * s, icon(ic, col)))
    return ''.join(o)


def sparkles(cx, cy, s=1, col='#ffd84a'):
    pts = [(-90, -40), (95, -55), (-70, -110), (80, -120), (0, -150)]
    return ''.join('<path d="M%.1f %.1f l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3z" fill="%s" opacity=".9"/>' % (cx + x * s, cy + y * s, col) for x, y in pts)


def bubbles(cx, cy, s=1):
    return ''.join('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#e8f7ff" stroke="#9fd0ea" stroke-width="1.2" opacity=".9"/><circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff"/>' % (cx + x * s, cy + y * s, r * s, cx + x * s - r * s * .35, cy + y * s - r * s * .35, r * s * .25) for x, y, r in [(110, -70, 9), (128, -96, 6), (96, -112, 5), (140, -60, 4)])


def confetti(cx, cy, s=1):
    cols = ['#ff6b6b', '#ffb84d', '#5fe08a', '#4dc3ff', '#9b7bff', '#ffe14d']
    out = ''
    for i in range(18):
        a = i * 2.4
        r = 70 + (i * 37) % 60
        x, y = cx + math.cos(a) * r * s * 1.2, cy - 60 * s + math.sin(a) * r * s * .7
        out += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.5" fill="%s" transform="rotate(%d %.1f %.1f)"/>' % (x, y, 7 * s, 3.5 * s, cols[i % 6], (i * 47) % 180, x, y)
    return out


def card(title, sub, svg, w=280, h=300):
    return '<div class="card"><svg viewBox="0 0 %d %d" width="%d" height="%d">%s</svg><b>%s</b><small>%s</small></div>' % (w, h, w, h, svg, title, sub)


# ---------- hero ----------
hero = ('<svg viewBox="0 0 700 520" width="700" height="520">'
        '<defs><radialGradient id="spot" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#fff6e3"/><stop offset="1" stop-color="#fff6e3" stop-opacity="0"/></radialGradient></defs>'
        '<ellipse cx="350" cy="330" rx="330" ry="210" fill="url(#spot)"/>'
        + robot(350, 300, 2.4, 'classic', '#3fe0d0', ic='house', ic_col='#14a39b', arm='brush') + sparkles(350, 260, 1.8, '#ffd84a') + '</svg>')

STATES = [
    ('ترحيب', 'حلقة فيروزية ثابتة + قفزة خفيفة', robot(140, 190, 1.25, ring='#3fe0d0', ic='house', ic_col='#14a39b', hop=10)),
    ('نجاح', 'حلقة خضراء + علامة صح + لمعان', robot(140, 190, 1.25, ring='#4fe36a', ic='check', ic_col='#22b14c', hop=14) + sparkles(140, 170, 1, '#ffd84a')),
    ('تلميح', 'حلقة صفراء نابضة + مصباح', robot(140, 190, 1.25, ring='#ffd23f', ic='bulb', ic_col='#f2a800', tilt=-6)),
    ('يفكّر', 'حلقة زرقاء متقطعة تدور', robot(140, 190, 1.25, ring='#4dc3ff', mode='seg', ic='dots', ic_col='#2a9be0')),
    ('تنبيه لطيف', 'حلقة برتقالية نصفية + علامة تعجب', robot(140, 190, 1.25, ring='#ff9a3d', mode='half', ic='bang', ic_col='#ff7a1a', tilt=5)),
    ('يعمل', 'حلقة بيضاء + ذراع الأدوات + فقاعات', robot(120, 200, 1.2, ring='#ffffff', arm='sponge') + bubbles(120, 200, 1)),
    ('يشحن', 'حلقة خافتة + بطارية', '<rect x="40" y="226" width="200" height="22" rx="11" fill="#2b3a48"/><rect x="50" y="230" width="180" height="6" rx="3" fill="#4fe36a" opacity=".6"/>' + robot(140, 190, 1.25, ring='#4fe36a', mode='half', glow=.4, ic='battery', ic_col='#3cbf5a')),
    ('احتفال', 'حلقة بألوان قوس قزح + نجمة', robot(140, 190, 1.25, mode='rainbow', ic='star', ic_col='#f2a800', hop=18) + confetti(140, 190, 1)),
]
states_html = ''.join(card(t, d, svg) for t, d, svg in STATES)

TOOLS = [('brush', 'فرشاة'), ('sponge', 'إسفنجة'), ('spray', 'بخّاخ'), ('vacuum', 'شفّاط'), ('screw', 'مفك'), ('wrench', 'مفتاح ربط'), ('roller', 'رول دهان'), ('lens', 'عدسة فحص')]
tools_html = ''.join('<div class="tool"><svg viewBox="-30 -30 60 60" width="84" height="84">%s</svg><span>%s</span></div>' % (tool(n, 0, 0, 1.25), t) for n, t in TOOLS)

skins_html = ''.join('<div class="skin"><svg viewBox="0 0 200 170" width="200" height="170">%s</svg><b>%s</b></div>' % (robot(100, 85, 1.0, k, '#3fe0d0' if k != 'navy' else '#ffd23f'), SKINS[k]['name']) for k in SKINS)

size_svg = ('<svg viewBox="0 0 520 240" width="520" height="240">'
            '<rect x="20" y="60" width="150" height="150" rx="10" fill="#c08a55"/><rect x="20" y="60" width="150" height="14" rx="6" fill="#d9a46d"/><text x="95" y="230" text-anchor="middle" font-size="14" font-weight="800" fill="#6a4a2a">كرسي</text>'
            + robot(300, 170, .9, ring='#3fe0d0') +
            '<line x1="236" y1="214" x2="364" y2="214" stroke="#6a4a2a" stroke-width="2"/><text x="300" y="232" text-anchor="middle" font-size="13" font-weight="800" fill="#6a4a2a">بحجم روبوت تنظيف منزلي حقيقي</text>'
            '<rect x="420" y="20" width="80" height="190" rx="8" fill="#e9dccb" stroke="#bfa98d" stroke-width="2"/><circle cx="486" cy="120" r="4" fill="#8a6a4a"/><text x="460" y="230" text-anchor="middle" font-size="14" font-weight="800" fill="#6a4a2a">باب</text></svg>')

RULES = [
    ('بلا وجه', 'لا عيون ولا فم ولا ملامح. لا يُحاكي كائناً حياً؛ هو جهاز منزلي.'),
    ('يتكلم بالضوء', 'الحلقة الضوئية لونها وحركتها هما لغته: ثابتة، نابضة، تدور، متقطعة.'),
    ('أيقونات مُسقطة', 'يعرض فوقه أيقونات ضوئية بسيطة (صح، مصباح، نقاط) بدل الكلام.'),
    ('أصوات أجهزة', 'نغمات إلكترونية قصيرة لطيفة، بلا كلام بشري ولا موسيقى.'),
    ('ذراع الأدوات', 'ذراع قابلة للطي تخرج من جانبه وتحمل الأداة المناسبة لكل لغز.'),
    ('شعار البيت', 'زر في منتصفه عليه شكل البيت: يربطه بهوية اللعبة.'),
]
rules_html = ''.join('<div class="rule"><b>%s</b><span>%s</span></div>' % r for r in RULES)

CSS = '''
@font-face{font-family:Cairo;src:url(fonts/Cairo.ttf)}
@font-face{font-family:Lalezar;src:url(fonts/Lalezar-Regular.ttf)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#efe6d8;font-family:Cairo,sans-serif;color:#2b2016;direction:rtl}
.sheet{width:1240px;margin:0 auto;padding:40px 40px 50px}
.sec{background:#fffaf2;border:2px solid #e3d3bb;border-radius:28px;padding:26px;margin-top:24px;box-shadow:0 6px 0 #d9c4a4}
h1{font-family:Lalezar;font-weight:400;font-size:54px;line-height:1.1;color:#14605b}
h1+p{font-size:18px;font-weight:700;color:#7a6248;margin-top:4px}
h2{font-family:Lalezar;font-weight:400;font-size:30px;color:#14605b;margin-bottom:14px}
.top{display:grid;grid-template-columns:700px 1fr;gap:24px;align-items:center}
.hero{background:radial-gradient(ellipse at 50% 60%,#fff,#f3e7d4);border-radius:24px}
.rules{display:grid;gap:10px}
.rule{background:#fff;border:2px solid #ecdcc4;border-radius:16px;padding:10px 14px}
.rule b{display:block;font-size:17px;color:#14605b}
.rule span{font-size:14px;font-weight:600;color:#6a5640;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.card{background:linear-gradient(180deg,#fff,#f7efe2);border:2px solid #ecdcc4;border-radius:20px;padding:10px 10px 14px;text-align:center}
.card svg{width:100%;height:auto}
.card b{display:block;font-size:20px;font-weight:900;color:#2b2016;margin-top:-8px}
.card small{font-size:13px;font-weight:700;color:#7a6248}
.tools{display:flex;justify-content:space-between}
.tool{display:flex;flex-direction:column;align-items:center;gap:6px;background:#fff;border:2px solid #ecdcc4;border-radius:18px;padding:10px 6px;width:128px}
.tool span{font-weight:800;font-size:15px}
.skins{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.skin{background:#fff;border:2px solid #ecdcc4;border-radius:18px;padding:6px;text-align:center}
.skin svg{width:100%;height:auto}
.skin b{font-size:15px;font-weight:900}
.row{display:grid;grid-template-columns:520px 1fr;gap:24px;align-items:center}
.note{font-size:16px;font-weight:700;color:#6a5640;line-height:1.9}
'''

html = '''<!doctype html><html lang="ar"><head><meta charset="utf-8"><style>%s</style></head><body>
<svg width="0" height="0" style="position:absolute"><defs><filter id="soft" x="-30%%" y="-60%%" width="160%%" height="220%%"><feGaussianBlur stdDeviation="6"/></filter></defs></svg>
<div class="sheet" id="s1">
 <h1>المساعد: روبوت البيت</h1><p>رفيق اللاعب في ترميم البيت المهجور · جهاز منزلي بلا وجه · يعبّر بالضوء</p>
 <div class="sec top"><div class="hero">%s</div><div class="rules">%s</div></div>
 <div class="sec"><h2>حالاته وتعبيراته (بالضوء فقط)</h2><div class="grid">%s</div></div>
</div>
<div class="sheet" id="s2">
 <div class="sec"><h2>ذراع الأدوات</h2><div class="tools">%s</div></div>
 <div class="sec"><h2>الأشكال (مشتريات تجميلية)</h2><div class="skins">%s</div></div>
 <div class="sec row"><div>%s</div><div class="note"><h2>الحجم والحركة</h2>بحجم روبوت تنظيف حقيقي، فيبدو واقعياً داخل البيت.<br>يتحرك بانزلاق ناعم على عجلاته، ويقفز قفزة صغيرة عند الفرح، ويميل قليلاً عند التلميح.<br>يدور حول نفسه عند الاحتفال، ويعود إلى قاعدة الشحن عند انتهاء المرحلة.</div></div>
</div>
</body></html>''' % (CSS, hero, rules_html, states_html, tools_html, skins_html, size_svg)
open(OUT, 'w').write(html)
print('ok')
