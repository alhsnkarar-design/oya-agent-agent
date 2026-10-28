# Domino chain puzzle mockups: 2.5D tabletop rendered with real 3D box projection into SVG.
import math

OUT = '/home/user/oya-agent-agent/design/domino/domino-mockups.html'
VIEW = (0.0, 0.85, 0.62)          # direction toward the viewer (front + above)
LIGHT = (0.38, 0.22)              # shadow offset per unit height (light from upper-left)


def proj(X, Y, Z):
    return X, Y * 0.62 - Z * 0.85


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join('%02x' % round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def hull(pts):
    pts = sorted(set((round(x, 2), round(y, 2)) for x, y in pts))
    if len(pts) < 3:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0:
            up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]


def solid(verts, faces, px, py, a, phi=0.0, pivot_u=0.0, color='#e8553f', mat='gloss', shadow=True, opacity=1.0, outline=None):
    """verts: local (u along path, v across, z up). Falls forward by phi around edge u=pivot_u, z=0."""
    ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
    cp, sp = math.cos(math.radians(phi)), math.sin(math.radians(phi))
    W = []
    for u, v, z in verts:
        du = u - pivot_u
        u2 = pivot_u + du * cp + z * sp
        z2 = -du * sp + z * cp
        W.append((px + u2 * ca - v * sa, py + u2 * sa + v * ca, z2))
    cx = sum(p[0] for p in W) / len(W); cy = sum(p[1] for p in W) / len(W); cz = sum(p[2] for p in W) / len(W)
    out = []
    if shadow:
        sh = [proj(x + z * LIGHT[0], y + z * LIGHT[1], 0) for x, y, z in W]
        h = hull(sh)
        out.append('<polygon points="%s" fill="#2a1405" fill-opacity=".30" filter="url(#sblur)"/>' % ' '.join('%.1f,%.1f' % p for p in h))
    polys = []
    for f in faces:
        P = [W[i] for i in f]
        e1 = [P[1][k] - P[0][k] for k in range(3)]; e2 = [P[2][k] - P[0][k] for k in range(3)]
        n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
        fc = [sum(p[k] for p in P) / len(P) for k in range(3)]
        if sum(n[k] * (fc[k] - (cx, cy, cz)[k]) for k in range(3)) < 0:
            n = [-c for c in n]
        ln = math.sqrt(sum(c * c for c in n)) or 1
        n = [c / ln for c in n]
        vis = n[0] * VIEW[0] + n[1] * VIEW[1] + n[2] * VIEW[2]
        if vis <= 0.01:
            continue
        # light from upper-left-front
        L = (-0.45, 0.35, 0.82)
        d = max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2])
        shade = mix('#000000', color, 0.55 + 0.45 * d) if d < 0.75 else mix(color, '#ffffff', (d - 0.75) * 1.1)
        pts = [proj(*p) for p in P]
        polys.append((fc[2] + fc[1] * 0.001, pts, shade, n))
    polys.sort(key=lambda t: t[0])
    for _, pts, shade, n in polys:
        ps = ' '.join('%.1f,%.1f' % p for p in pts)
        out.append('<polygon points="%s" fill="%s" stroke="%s" stroke-width=".7" stroke-linejoin="round"/>' % (ps, shade, outline or mix(color, '#000000', .45)))
        if mat == 'gloss':
            out.append('<polygon points="%s" fill="url(#gloss)" opacity=".55"/>' % ps)
        elif mat == 'wood':
            out.append('<polygon points="%s" fill="url(#woodgrain)" opacity=".5"/>' % ps)
        elif mat == 'glass':
            out.append('<polygon points="%s" fill="#ffffff" opacity=".18"/>' % ps)
        elif mat == 'marble':
            out.append('<polygon points="%s" fill="url(#marble)" opacity=".6"/>' % ps)
    g = '<g opacity="%s">%s</g>' % (opacity, ''.join(out))
    return (py, g)


BOX_F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]


def box(T, Wd, H):
    return [(-T / 2, -Wd / 2, 0), (T / 2, -Wd / 2, 0), (T / 2, Wd / 2, 0), (-T / 2, Wd / 2, 0),
            (-T / 2, -Wd / 2, H), (T / 2, -Wd / 2, H), (T / 2, Wd / 2, H), (-T / 2, Wd / 2, H)]


def domino(x, y, a, phi=0, color='#e8553f', mat='gloss', opacity=1, s=1.0):
    T, Wd, H = 5.5 * s, 20 * s, 34 * s
    return solid(box(T, Wd, H), BOX_F, x, y, a, phi, T / 2, color, mat, True, opacity)


def ramp(x, y, a, color='#3a8fd6', L=46, Wd=26, H=24):
    v = [(-L / 2, -Wd / 2, 0), (L / 2, -Wd / 2, 0), (L / 2, Wd / 2, 0), (-L / 2, Wd / 2, 0), (L / 2, -Wd / 2, H), (L / 2, Wd / 2, H)]
    f = [[0, 1, 2, 3], [0, 1, 4], [3, 2, 5], [1, 2, 5, 4], [0, 3, 5, 4]]
    return solid(v, f, x, y, a, 0, 0, color, 'gloss')


def block(x, y, a, T, Wd, H, color, mat='gloss'):
    return solid(box(T, Wd, H), BOX_F, x, y, a, 0, 0, color, mat)


def ball(x, y, r=10, z=0):
    sx, sy = proj(x, y, z + r)
    gx, gy = proj(x + r * LIGHT[0], y + r * LIGHT[1], 0)
    return (y, '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#2a1405" opacity=".3" filter="url(#sblur)"/>'
               '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="url(#steel)" stroke="#4a5866" stroke-width=".8"/>'
               '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#fff" opacity=".85"/>'
               % (gx + 2, gy + 1, r * 1.1, r * .55, sx, sy, r, sx - r * .35, sy - r * .4, r * .3, r * .18))


def lamp(x, y, lit=False, s=1.0):
    bx, by = proj(x, y, 0)
    r = 15 * s
    halo = ('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="url(#halo)"/>' % (bx, by - 14 * s, r * 3.2, r * 2.6)) if lit else ''
    dome = 'url(#lampOn)' if lit else 'url(#lampOff)'
    return (y, '%s<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#2a1405" opacity=".32" filter="url(#sblur)"/>'
               '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#38414d"/>'
               '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="url(#steelBand)"/>'
               '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#5d6876"/>'
               '<path d="M%.1f %.1f a%.1f %.1f 0 0 1 %.1f 0 z" fill="%s" stroke="%s" stroke-width="1"/>'
               '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#fff" opacity=".8"/>'
               % (halo, bx + 5, by + 3, r * 1.3, r * .6,
                  bx, by, r, r * .5,
                  bx - r, by - 6 * s, 2 * r, 6 * s,
                  bx, by - 6 * s, r, r * .5,
                  bx - r * .82, by - 7 * s, r * .82, r * 1.05, r * 1.64, dome, '#c98a00' if lit else '#7d8fa3',
                  bx - r * .35, by - 7 * s - r * .62, r * .22, r * .13))


def pusher(x, y, a):
    py_, g = block(x, y, a, 22, 26, 18, '#14a39b')
    sx, sy = proj(x, y, 18)
    arrow = '<g transform="translate(%.1f %.1f)"><circle r="9" fill="#fff"/><path d="M-4 0 H4 M1 -3 L4 0 L1 3" stroke="#0d7a74" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(%s)"/></g>' % (sx, sy - 6, a)
    return (py_, g + arrow)


def path_line(x1, y1, x2, y2, step=13):
    n = max(1, int(math.hypot(x2 - x1, y2 - y1) / step))
    a = math.degrees(math.atan2(y2 - y1, x2 - x1))
    return [(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, a) for i in range(n + 1)]


def path_arc(cx, cy, r, a0, a1, step=13):
    n = max(1, int(abs(math.radians(a1 - a0)) * r / step))
    out = []
    for i in range(n + 1):
        t = math.radians(a0 + (a1 - a0) * i / n)
        tang = math.degrees(t) + (90 if a1 > a0 else -90)
        out.append((cx + r * math.cos(t), cy + r * math.sin(t), tang))
    return out


PAL = ['#e8553f', '#f2a823', '#14a39b', '#3a8fd6', '#8c6be0']


def chain(points, colors=None, fallen_upto=-1, lean=(), mat='gloss', s=1.0, skip_first=False):
    items = []
    for i, (x, y, a) in enumerate(points):
        if skip_first and i == 0:
            continue
        c = (colors or PAL)[(i // 4) % len(colors or PAL)] if not isinstance(colors, str) else colors
        phi = 0
        if i <= fallen_upto:
            phi = 74
        elif i - fallen_upto - 1 < len(lean):
            phi = lean[i - fallen_upto - 1]
        items.append(domino(x, y, a, phi, c, mat, 1, s))
    return items


def scene(items):
    return ''.join(g for _, g in sorted(items, key=lambda t: t[0]))


DEFS = '''
<defs>
 <filter id="sblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.42" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .17  0 0 0 0 .05  0 0 0 .55 0"/></filter>
 <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
 <pattern id="woodgrain" width="40" height="8" patternUnits="userSpaceOnUse"><rect width="40" height="8" fill="none"/><path d="M0 2 Q10 1 20 3 T40 2 M0 6 Q12 5 22 7 T40 6" stroke="#5a2f10" stroke-width=".7" fill="none" opacity=".6"/></pattern>
 <pattern id="marble" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 8 Q8 4 14 12 T30 10 M4 30 Q10 20 20 24 T30 18" stroke="#9aa3ad" stroke-width=".8" fill="none"/></pattern>
 <radialGradient id="steel" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#c9d3dc"/><stop offset=".8" stop-color="#6f7f8f"/><stop offset="1" stop-color="#46525e"/></radialGradient>
 <linearGradient id="steelBand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a434e"/><stop offset=".35" stop-color="#9aa6b3"/><stop offset="1" stop-color="#2c333c"/></linearGradient>
 <radialGradient id="lampOff" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#c9d9e8"/><stop offset="1" stop-color="#7f97ad"/></radialGradient>
 <radialGradient id="lampOn" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff2a6"/><stop offset=".8" stop-color="#ffc21a"/><stop offset="1" stop-color="#f29a00"/></radialGradient>
 <radialGradient id="halo"><stop offset="0" stop-color="#ffe680" stop-opacity=".85"/><stop offset=".5" stop-color="#ffd84a" stop-opacity=".3"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient>
 <linearGradient id="table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5226"/><stop offset=".5" stop-color="#b0743d"/><stop offset="1" stop-color="#9a5f2e"/></linearGradient>
 <radialGradient id="vign" cx=".45" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0a00" stop-opacity=".55"/></radialGradient>
 <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d6" stop-opacity=".38"/><stop offset=".6" stop-color="#fff3d6" stop-opacity="0"/></linearGradient>
 <linearGradient id="starG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7b0"/><stop offset=".5" stop-color="#ffd21f"/><stop offset="1" stop-color="#f29a00"/></linearGradient>
</defs>'''


def table(w, h, tone='#b0743d'):
    planks = ''.join('<line x1="0" y1="%d" x2="%d" y2="%d" stroke="#5a2e10" stroke-opacity=".45" stroke-width="1.6"/><line x1="0" y1="%d" x2="%d" y2="%d" stroke="#f3c48e" stroke-opacity=".25" stroke-width="1"/>' % (y, w, y, y + 2, w, y + 2) for y in range(38, h, 58))
    seams = ''.join('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#5a2e10" stroke-opacity=".35" stroke-width="1.4"/>' % (x, y0, x, y0 + 58) for i, y0 in enumerate(range(-20, h, 58)) for x in ([120, 300] if i % 2 else [40, 220, 370]))
    return ('<rect width="%d" height="%d" fill="url(#table)"/><rect width="%d" height="%d" filter="url(#grain)"/>%s%s'
            '<polygon points="0,0 %d,0 %d,%d 0,%d" fill="url(#sun)"/>' % (w, h, w, h, planks, seams, w * .9, w * .2, h, h * .7))


W, H = 390, 844


def frame(i, title, body):
    return '<div class="ph" id="s%d"><div class="cap">%s</div><div class="scr">%s</div></div>' % (i, title, body)


def svg_layer(content, h=H, extra=''):
    return '<svg class="bg" viewBox="0 0 %d %d" width="%d" height="%d">%s%s<rect width="%d" height="%d" fill="url(#vign)"/>%s</svg>' % (W, h, W, h, DEFS, content, W, h, extra)


ICON = {
    'pause': '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>',
    'undo': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    'reset': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    'bulb': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    'gear': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    'cart': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/></svg>',
    'map': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    'home': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
    'play': '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>',
    'back': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>',
    'lock': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    'film': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    'speed': '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 5v14l8-7zM12 5v14l8-7z" fill="currentColor"/></svg>',
}


def coin(sz=22):
    return '<svg width="%d" height="%d" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#ffc72c" stroke="#b97700" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="none" stroke="#e59a00" stroke-width="1.4"/><rect x="10" y="7.5" width="4" height="9" rx="1" fill="#e59a00"/><circle cx="9" cy="8" r="2" fill="#fff" opacity=".6"/></svg>' % (sz, sz)


def star(sz, on=True):
    return '<svg class="%s" width="%d" height="%d" viewBox="0 0 24 24"><polygon points="12 1.5 15.2 8.3 22.5 9.2 17.1 14.2 18.6 21.6 12 17.9 5.4 21.6 6.9 14.2 1.5 9.2 8.8 8.3" fill="%s" stroke="%s" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 8.6 L12 3.8 L13.6 7.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/></svg>' % ('' if on else 'off', sz, sz, 'url(#starG)' if on else '#cdbfae', '#b86b00' if on else '#a8988a')


def mini_scene(items, w, h, vb):
    return '<svg width="%d" height="%d" viewBox="%s">%s%s</svg>' % (w, h, vb, DEFS, scene(items))


# ---------- 1 HOME ----------
spiral = []
pts = path_arc(195, 760, 92, 200, 520, 12.5)
spiral += chain(pts, PAL)
pts2 = path_arc(195, 760, 52, 520, 760, 12.5)
spiral += chain(pts2, ['#f7efe2'], mat='marble')
spiral.append(lamp(195, 760, True, 1.1))
spiral.append(pusher(100, 690, 20))
home = svg_layer(table(W, H) + '<g transform="translate(-68 -150) scale(1.35)">' + scene(spiral) + '</g>') + '''
<div class="top"><div class="res">%s<b>1,250</b><i>+</i></div><div class="res">%s<b>48</b></div><button class="rbtn">%s</button></div>
<div class="logo"><div class="lg1">سلسلة</div><div class="lg2">الدومينو</div><div class="lgs">ابنِ · ادفع · أضِئ</div></div>
<div class="homeact"><button class="big">%s العب <small>المرحلة 7</small></button></div>
<nav class="nav"><button>%s<span>المتجر</span></button><button class="on">%s<span>الرئيسية</span></button><button>%s<span>العوالم</span></button></nav>
''' % (coin(), star(20), ICON['gear'], ICON['play'], ICON['cart'], ICON['home'], ICON['map'])

# ---------- shared level layout (screens 2-4) ----------
TX, TY, SC = 8, 70, 1.13
seg1 = path_line(74, 230, 262, 230)
spur1 = path_line(262, 230, 318, 230)[1:]
seg2 = path_arc(262, 315, 85, -90, 90)[1:]
seg3 = path_line(262, 400, 110, 400)[1:]
spur3 = path_line(110, 400, 70, 400)[1:]
seg4 = path_arc(110, 485, 85, 270, 90)[1:]
seg5 = path_line(110, 570, 240, 570)[1:]
# (points, colour, start time) -- time = order in which a piece falls
T2 = len(seg1); T3 = T2 + len(seg2); T4 = T3 + len(seg3); T5 = T4 + len(seg4)
SEGS = [(seg1, '#e8553f', 0), (spur1, '#e8553f', T2), (seg2, '#f2a823', T2), (seg3, '#14a39b', T3),
        (spur3, '#14a39b', T4), (seg4, '#8c6be0', T4), (seg5, '#3a8fd6', T5)]
GAP = (3, [5, 6])          # segment index, piece indices missing in the build screen
LAMPS = [(346, 230), (42, 400), (330, 650)]


def level(fall_t=-1, lit=(), build=False, ball_at=(282, 556)):
    it = [pusher(52, 230, 0)]
    for si, (pts, col, t0) in enumerate(SEGS):
        for j, (x, y, a) in enumerate(pts):
            t = t0 + j
            if build and si == GAP[0] and j in GAP[1]:
                if j == GAP[1][0]:
                    it.append(domino(x, y, a, 0, col, 'gloss', .45))
                continue
            d = fall_t - t
            phi = 74 if d >= 0 else ([52, 26, 10][-d - 1] if -d <= 3 else 0)
            it.append(domino(x, y, a, phi, col))
    it.append(ramp(270, 590, 30, '#14a39b', 50, 28, 22))
    it.append(ball(*ball_at, 11))
    for n, (lx, ly) in enumerate(LAMPS):
        it.append(lamp(lx, ly, n in lit))
    return '<g transform="translate(%s %s) scale(%s)">%s</g>' % (TX, TY, SC, scene(it))


def to_screen(x, y, z=0):
    sx, sy = proj(x, y, z)
    return TX + sx * SC, TY + sy * SC


HUD = ('<div class="hud"><button class="rbtn">' + ICON['pause'] + '</button><div class="lvl"><small>عالم الطاولة الخشبية</small><b>المرحلة 7</b></div>'
       '<div class="goal"><small>الأضواء</small><b><span class="ltr">%d / 3</span></b><div class="lamps">%s</div></div></div>')

# ---------- 2 GAMEPLAY BUILD ----------
gx, gy, ga = SEGS[GAP[0]][0][GAP[1][0]]
g1 = to_screen(gx, gy, 16)
build = svg_layer(table(W, H) + level(build=True) +
                  '<circle cx="%.1f" cy="%.1f" r="30" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="6 5"/>'
                  '<g transform="translate(%.1f %.1f)"><circle r="14" fill="#fff" stroke="#14a39b" stroke-width="2.5"/><path d="M-5 -1 a5.5 5.5 0 1 1 1.5 5" fill="none" stroke="#0d7a74" stroke-width="2.2" stroke-linecap="round"/><path d="M-8 -3 L-5 -1 L-2 -4" fill="none" stroke="#0d7a74" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>'
                  % (g1[0], g1[1] + 4, g1[0] + 34, g1[1] - 20)) + HUD % (0, '<i></i><i></i><i></i>') + '''
<div class="tip">اسحب القطعة إلى الفراغ · اضغط ↻ لتدويرها</div>
<div class="tray">
  <div class="pieces">
    <div class="pc sel">%s<span class="cnt">×2</span><b>دومينو</b></div>
    <div class="pc">%s<span class="cnt">×1</span><b>منحنى</b></div>
    <div class="pc">%s<span class="cnt">×1</span><b>منحدر</b></div>
    <div class="pc">%s<span class="cnt">×1</span><b>دومينو كبير</b></div>
  </div>
  <div class="actrow"><button class="sq">%s</button><button class="sq">%s</button><button class="big push">ادفع %s</button></div>
</div>
''' % (mini_scene([domino(30, 46, 0, 0, '#14a39b')], 64, 54, '8 -2 44 40'),
       mini_scene(chain(path_arc(16, 60, 22, -90, 0, 9), ['#f2a823'], s=.7), 64, 54, '8 6 40 34'),
       mini_scene([ramp(30, 50, 0, '#3a8fd6', 36, 20, 18)], 64, 54, '8 4 46 34'),
       mini_scene([domino(30, 50, 0, 0, '#8c6be0', s=1.35)], 64, 54, '6 -12 48 46'),
       ICON['undo'], ICON['bulb'], ICON['play'])

# ---------- 3 GAMEPLAY RUNNING ----------
FT = T3 + 5
lead = seg3[FT - T3 + 2]
l1 = to_screen(*LAMPS[0], 30)
ld = to_screen(lead[0], lead[1], 34)
run = svg_layer(table(W, H) + level(FT, lit=(0,)) +
                ''.join('<path d="M%.1f %.1f q8 -6 16 0" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="%.2f"/>' % (ld[0] - 8 - j * 12, ld[1] - 10 - j * 8, .9 - j * .25) for j in range(3))) + HUD % (1, '<i class="on"></i><i></i><i></i>') + '''
<div class="pop" style="top:%dpx;left:%dpx">+1 ضوء!</div>
<div class="combo"><b class="ltr">×%d</b><span>قطعة سقطت</span></div>
<div class="runbar"><button class="sq light">%s</button><div class="slow">حركة بطيئة عند الأضواء</div><button class="sq light">%s</button></div>
''' % (l1[1] - 70, l1[0] - 110, FT + 6, ICON['reset'], ICON['speed'])

# ---------- 4 WIN ----------
win = svg_layer(table(W, H) + level(999, lit=(0, 1, 2), ball_at=(318, 640))) + '''
<div class="dim"></div>
<div class="panel">
  <div class="stars">%s<span class="mid">%s</span>%s</div>
  <div class="ribbon">رائع!</div>
  <h3>المرحلة 7 مكتملة</h3>
  <div class="chips"><div class="chip">💡 <span class="ltr">3 / 3</span> أضواء</div><div class="chip">🧩 قطعة واحدة متبقية</div></div>
  <div class="rew"><div class="rw">%s<b>+40</b></div><div class="rw">%s<b>+3</b></div></div>
  <button class="big blue">%s شاهد الإعادة</button>
  <button class="big purple">%s ضاعف العملات <span class="tag">إعلان اختياري</span></button>
  <button class="big">التالي</button>
</div>
''' % (star(84), star(108), star(84), coin(26), star(24), ICON['film'], ICON['film'])

# ---------- 5 WORLDS ----------
WORLDS = [('الطاولة الخشبية', 'دومينو · منحنيات', '#b0743d', 60, 3, 'done'), ('المكتبة', 'سلالم من الكتب', '#7a4a8c', 52, 3, 'done'),
          ('المطبخ', 'منحدرات وكرات', '#2f9b8f', 34, 3, 'cur'), ('الحديقة', 'مسارات متفرعة', '#4a9a3a', 0, 3, 'lock'),
          ('الورشة', 'بوابات وأذرع', '#c46a2a', 0, 3, 'lock'), ('السلالم', 'طاولات على ارتفاعات', '#3a6fb8', 0, 3, 'lock'),
          ('الطاولات المتعددة', 'قفزات بين الطاولات', '#a8553a', 0, 3, 'lock'), ('الممرات الزجاجية', 'أرضيات زلقة', '#3aa0c8', 0, 3, 'lock'),
          ('التوقيت', 'بوابات تُفتح وتُغلق', '#6b5ad6', 0, 3, 'lock'), ('العرض الكبير', 'كل شيء معاً', '#d4a017', 0, 3, 'lock')]
cards = ''
for n, (name, sub, col, stars_, _, st) in enumerate(WORLDS):
    prev = mini_scene(chain(path_arc(40, 70, 26, 200, 380, 10), [col, mix(col, '#ffffff', .35)], s=.8) + [lamp(40, 70, st != 'lock', .7)], 96, 74, '4 2 72 56')
    prog = '<div class="wprog"><i style="width:%d%%"></i></div><span class="wst">%s <b class="ltr">%d / 60</b></span>' % (stars_ * 100 // 60, star(14), stars_)
    cards += '<div class="world %s" style="--wc:%s"><div class="wn">%d</div><div class="wpic">%s</div><div class="wtx"><b>%s</b><small>%s · 20 مرحلة</small>%s</div>%s</div>' % (
        st, col, n + 1, prev, name, sub, prog if st != 'lock' else '<span class="wlock">%s أكمل العالم السابق</span>' % ICON['lock'],
        '<button class="wgo">%s</button>' % ICON['play'] if st == 'cur' else '')
worlds = svg_layer(table(W, H, '#9a6535')) + '''
<div class="phead"><button class="rbtn">%s</button><h2>العوالم</h2><div class="res">%s<b>146</b></div></div>
<div class="wlist">%s</div>
<nav class="nav"><button>%s<span>المتجر</span></button><button>%s<span>الرئيسية</span></button><button class="on">%s<span>العوالم</span></button></nav>
''' % (ICON['back'], star(18), cards, ICON['cart'], ICON['home'], ICON['map'])

# ---------- 6 SHOP ----------
def skin(name, col, mat, price, owned=False, outline=None):
    sc = mini_scene(chain(path_line(10, 60, 70, 60, 14), col, mat=mat), 110, 70, '0 4 84 52')
    return '<div class="skin">%s<b>%s</b>%s</div>' % (sc, name, '<span class="own">مُستخدم ✓</span>' if owned else '<button class="price">%s</button>' % price)

skins = (skin('ملوّن', PAL, 'gloss', '', True) + skin('خشب الجوز', '#9a5a2a', 'wood', '$0.99') +
         skin('زجاج', '#a9d8ee', 'glass', '$1.49') + skin('رخام', '#f1ece4', 'marble', '$1.49') +
         skin('نحاسي', '#c8783a', 'gloss', '$1.99') + skin('ليلي مضيء', '#2a3550', 'gloss', '$1.99'))
coinsrow = ''.join('<div class="cpk">%s<b>%s</b>%s<button class="price">%s</button></div>' % (coin(30 + i * 4), amt, ('<span class="bonus">%s</span>' % bon) if bon else '', pr)
                   for i, (amt, bon, pr) in enumerate([('500', '', '$0.49'), ('1,200', '', '$0.99'), ('3,500', '+15%', '$2.99'), ('10,000', '+40%', '$5.99')]))
shop = svg_layer(table(W, H, '#9a6535')) + '''
<div class="phead"><button class="rbtn">%s</button><h2>المتجر</h2><div class="res">%s<b>1,250</b></div></div>
<div class="shop">
  <div class="starter"><div class="stl"><span class="stag">مرة واحدة فقط</span><b>حزمة البداية</b><small>1,000 عملة · 3 تلميحات · شكل «خشب الجوز»</small></div><button class="price big2">$0.99</button></div>
  <h4>أشكال الدومينو</h4><div class="skins">%s</div>
  <h4>العملات</h4><div class="coins">%s</div>
  <div class="row2"><div class="noads"><b>إزالة الإعلانات</b><small>للأبد · تبقى المكافآت الاختيارية</small><button class="price">$2.99</button></div>
  <div class="free"><b>50 عملة مجاناً</b><small>شاهد إعلاناً قصيراً</small><button class="price pur">%s مشاهدة</button></div></div>
  <div class="trust">✓ لا صناديق حظ · ترى بالضبط ما تشتريه</div>
</div>
''' % (ICON['back'], coin(), skins, coinsrow, ICON['film'])

SCREENS = [('الرئيسية', home), ('اللعب: مرحلة البناء', build), ('اللعب: لحظة الدفع', run), ('الفوز', win), ('العوالم', worlds), ('المتجر', shop)]

CSS = '''
@font-face{font-family:Cairo;src:url(fonts/Cairo.ttf)}
@font-face{font-family:Lalezar;src:url(fonts/Lalezar-Regular.ttf)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#2b1a10;font-family:Cairo,sans-serif;padding:40px;display:flex;flex-wrap:wrap;gap:36px;justify-content:center}
.ph{display:flex;flex-direction:column;align-items:center;gap:12px;padding:6px}
.cap{color:#f3dcc0;font-weight:800;font-size:20px}
.scr{position:relative;width:390px;height:844px;border-radius:44px;overflow:hidden;direction:rtl;color:#fff;box-shadow:0 0 0 10px #120a05,0 30px 60px rgba(0,0,0,.6)}
.bg{position:absolute;inset:0}
.ltr{direction:ltr;unicode-bidi:isolate;display:inline-block}
button{font:inherit;color:inherit;border:0;background:none}
.off{opacity:.9}
.top,.hud,.phead{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:8px;padding:50px 16px 0;z-index:3}
.res{height:38px;display:flex;align-items:center;gap:6px;padding:0 12px 0 6px;border-radius:20px;background:rgba(40,20,8,.72);border:2px solid rgba(255,220,170,.35);font-weight:900;font-size:16px;backdrop-filter:blur(4px)}
.res i{font-style:normal;width:22px;height:22px;border-radius:7px;background:#22c25a;display:grid;place-items:center;font-size:16px;margin-right:4px}
.rbtn,.sq{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;background:linear-gradient(180deg,#2cc4b9,#0d8a83);border:2.5px solid #075e59;box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 4px 0 #064c48}
.top .rbtn{margin-right:auto}
.logo{position:absolute;top:118px;left:0;right:0;text-align:center;z-index:3}
.lg1{font-family:Lalezar;font-size:60px;line-height:1;color:#fff;text-shadow:0 4px 0 #b4471f,0 8px 18px rgba(60,20,0,.5)}
.lg2{font-family:Lalezar;font-size:76px;line-height:.95;background:linear-gradient(180deg,#fff6c9,#ffc72c 55%,#f29a00);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #8a4a10) drop-shadow(0 8px 14px rgba(60,20,0,.45))}
.lgs{display:inline-block;margin-top:10px;padding:4px 16px;border-radius:14px;background:rgba(40,20,8,.6);font-weight:800;font-size:15px;color:#ffe2b8}
.homeact{position:absolute;left:26px;right:26px;bottom:128px;z-index:3}
.big{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:66px;border-radius:22px;font-family:Lalezar;font-size:32px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.22);overflow:hidden;
 background:linear-gradient(180deg,#ffb36b 0%,#ff7a3d 45%,#ef5a1f 100%);border:3px solid #a8380c;box-shadow:inset 0 4px 0 rgba(255,255,255,.5),0 6px 0 #8a2c08,0 14px 24px rgba(60,20,0,.35)}
.big::after{content:"";position:absolute;top:4px;left:14px;right:14px;height:22px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.45),transparent)}
.big small{font-family:Cairo;font-size:14px;font-weight:800;background:rgba(0,0,0,.18);border-radius:10px;padding:0 8px}
.big.blue{background:linear-gradient(180deg,#5fe0d6,#18b3a8 45%,#0d8a83);border-color:#075e59;box-shadow:inset 0 4px 0 rgba(255,255,255,.5),0 6px 0 #064c48,0 14px 24px rgba(0,40,40,.3)}
.big.purple{background:linear-gradient(180deg,#c7a6ff,#8c5cff 45%,#6a3be6);border-color:#4a1fb0;box-shadow:inset 0 4px 0 rgba(255,255,255,.5),0 6px 0 #3a1690;font-size:24px}
.tag{font-family:Cairo;font-size:12px;font-weight:800;background:rgba(255,255,255,.25);border-radius:10px;padding:1px 8px}
.nav{position:absolute;left:12px;right:12px;bottom:22px;height:82px;border-radius:26px;display:flex;justify-content:space-around;align-items:center;z-index:3;
 background:linear-gradient(180deg,#fff8ec,#f3e2c6);border:3px solid #d8b07a;box-shadow:inset 0 3px 0 #fff,0 6px 0 #a8743a,0 16px 30px rgba(0,0,0,.35)}
.nav button{display:flex;flex-direction:column;align-items:center;gap:2px;color:#9a6a3a;font-weight:800;font-size:13px;width:86px;padding:6px 0;border-radius:18px}
.nav button.on{color:#fff;background:linear-gradient(180deg,#ffb36b,#ef5a1f);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 3px 0 #8a2c08;transform:translateY(-8px)}
.hud{align-items:flex-start}
.lvl{flex:1;text-align:center;padding-top:2px}
.lvl small{display:block;font-size:12px;font-weight:800;color:#ffe2b8;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.lvl b{font-family:Lalezar;font-weight:400;font-size:28px;line-height:1.1;text-shadow:0 3px 0 #7a3a10,0 4px 10px rgba(0,0,0,.4)}
.goal{min-width:92px;border-radius:18px;padding:5px 10px 7px;text-align:center;color:#5a3608;background:linear-gradient(180deg,#fff8ec,#f3e2c6);border:3px solid #d8b07a;box-shadow:inset 0 3px 0 #fff,0 4px 0 #a8743a}
.goal small{display:block;font-size:11px;font-weight:900}
.goal b{display:block;font-family:Lalezar;font-weight:400;font-size:22px;line-height:1}
.lamps{display:flex;gap:5px;justify-content:center;margin-top:3px}
.lamps i{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#b8c8d8 60%,#7f97ad)}
.lamps i.on{background:radial-gradient(circle at 35% 30%,#fff,#ffe066 50%,#f29a00);box-shadow:0 0 10px #ffc72c}
.tip{position:absolute;top:640px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:6px 14px;border-radius:14px;background:rgba(40,20,8,.72);font-weight:800;font-size:13px;color:#ffe9c9;z-index:3}
.tray{position:absolute;left:0;right:0;bottom:0;padding:14px 14px 30px;border-radius:30px 30px 0 0;z-index:3;background:linear-gradient(180deg,#fff8ec,#f3e2c6);border-top:3px solid #d8b07a;box-shadow:0 -10px 30px rgba(0,0,0,.35)}
.pieces{display:flex;gap:8px;justify-content:space-between}
.pc{position:relative;flex:1;height:96px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;border:2.5px solid #ead1a8;box-shadow:0 4px 0 #dcbb88;color:#6a4310}
.pc.sel{border-color:#14a39b;box-shadow:0 4px 0 #0d7a74,0 0 0 4px rgba(20,163,155,.25);transform:translateY(-4px)}
.pc b{font-size:12px;font-weight:900}
.pc .cnt{position:absolute;top:-8px;left:-6px;min-width:30px;height:24px;border-radius:12px;background:linear-gradient(180deg,#ff8a5c,#ef5a1f);border:2.5px solid #fff;color:#fff;font-weight:900;font-size:12px;display:grid;place-items:center}
.actrow{display:flex;gap:10px;margin-top:14px;align-items:center}
.sq{color:#fff}
.sq.light{background:linear-gradient(180deg,#fff8ec,#f3e2c6);border-color:#d8b07a;color:#9a5a20;box-shadow:inset 0 3px 0 #fff,0 4px 0 #a8743a}
.push{height:60px;font-size:30px;flex:1}
.pop{position:absolute;z-index:4;font-family:Lalezar;font-size:30px;color:#fff6c0;text-shadow:0 3px 0 #b86b00,0 0 16px rgba(255,200,40,.9);transform:rotate(-8deg)}
.combo{position:absolute;top:162px;right:16px;z-index:3;text-align:center;padding:6px 14px;border-radius:18px;background:rgba(40,20,8,.72);border:2px solid rgba(255,220,170,.35)}
.combo b{display:block;font-family:Lalezar;font-weight:400;font-size:30px;line-height:1;color:#ffc72c}
.combo span{font-size:11px;font-weight:800;color:#ffe2b8}
.runbar{position:absolute;left:16px;right:16px;bottom:34px;z-index:3;display:flex;align-items:center;gap:10px}
.slow{flex:1;text-align:center;padding:10px;border-radius:16px;background:rgba(40,20,8,.72);font-weight:800;font-size:13px;color:#ffe2b8}
.dim{position:absolute;inset:0;background:rgba(25,12,4,.55);z-index:2}
.panel{position:absolute;left:20px;right:20px;top:230px;z-index:3;border-radius:30px;padding:70px 18px 22px;text-align:center;color:#5a3608;
 background:linear-gradient(180deg,#fffaf1,#f6e6cb);border:4px solid #e2b57a;box-shadow:inset 0 4px 0 #fff,0 8px 0 #a8743a,0 30px 60px rgba(0,0,0,.45)}
.panel .stars{position:absolute;top:-130px;left:0;right:0;display:flex;justify-content:center;align-items:flex-end}
.panel .stars svg{filter:drop-shadow(0 5px 0 #a35c00) drop-shadow(0 0 18px rgba(255,200,40,.6))}
.panel .mid{margin-bottom:20px}
.ribbon{position:absolute;top:-30px;left:-14px;right:-14px;height:64px;border-radius:18px;display:grid;place-items:center;font-family:Lalezar;font-size:38px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.25);
 background:linear-gradient(180deg,#5fe0d6,#18b3a8 50%,#0d8a83);border:3px solid #075e59;box-shadow:inset 0 4px 0 rgba(255,255,255,.4),0 5px 0 #064c48}
.panel h3{font-size:21px;font-weight:900}
.chips{display:flex;gap:8px;justify-content:center;margin-top:8px}
.chip{font-size:13px;font-weight:800;padding:3px 10px;border-radius:12px;background:#fff;border:2px solid #ecd2a6}
.rew{display:flex;gap:10px;justify-content:center;margin:14px 0 6px}
.rw{display:flex;align-items:center;gap:6px;min-width:96px;justify-content:center;border-radius:16px;padding:6px 10px;background:#fff;border:3px solid #f0cf8f;box-shadow:0 3px 0 #d9a85a;font-weight:900;font-size:22px}
.panel .big{margin-top:12px;height:58px;font-size:26px}
.phead h2{flex:1;font-family:Lalezar;font-weight:400;font-size:34px;text-shadow:0 3px 0 #7a3a10,0 4px 12px rgba(0,0,0,.45)}
.wlist{position:absolute;top:112px;left:14px;right:14px;bottom:118px;display:flex;flex-direction:column;gap:10px;overflow:hidden;z-index:3}
.world{position:relative;display:flex;align-items:center;gap:10px;padding:8px 12px 8px 10px;border-radius:22px;color:#5a3608;background:linear-gradient(180deg,#fffaf1,#f6e6cb);border:3px solid #e2b57a;box-shadow:inset 0 3px 0 #fff,0 5px 0 #a8743a;flex-shrink:0}
.world.cur{border-color:#ef5a1f;box-shadow:inset 0 3px 0 #fff,0 5px 0 #8a2c08,0 0 0 4px rgba(239,90,31,.25)}
.world.lock{filter:saturate(.25);opacity:.82}
.wn{position:absolute;top:-6px;right:-6px;width:26px;height:26px;border-radius:9px;background:var(--wc);color:#fff;font-weight:900;font-size:13px;display:grid;place-items:center;border:2.5px solid #fff}
.wpic{width:96px;height:74px;border-radius:14px;background:linear-gradient(180deg,#c88a50,#a0652f);overflow:hidden;flex-shrink:0;box-shadow:inset 0 2px 6px rgba(0,0,0,.3)}
.wtx{flex:1;min-width:0}
.wtx b{display:block;font-size:17px;font-weight:900}
.wtx small{display:block;font-size:12px;font-weight:700;color:#8a5a1a}
.wprog{height:9px;border-radius:5px;background:#ead6b6;margin-top:5px;overflow:hidden}
.wprog i{display:block;height:100%;background:linear-gradient(90deg,#ffc72c,#ef5a1f);border-radius:5px}
.wst{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:800;margin-top:2px}
.wlock{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:800;color:#8a6a4a;margin-top:4px}
.wgo{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;background:linear-gradient(180deg,#ffb36b,#ef5a1f);border:2.5px solid #a8380c;box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 4px 0 #8a2c08}
.shop{position:absolute;top:110px;left:14px;right:14px;bottom:20px;z-index:3;display:flex;flex-direction:column;gap:8px}
.shop h4{font-size:15px;font-weight:900;color:#ffe2b8;text-shadow:0 1px 3px rgba(0,0,0,.6)}
.starter{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:22px;background:linear-gradient(135deg,#ff9a52,#ef5a1f);border:3px solid #a8380c;box-shadow:inset 0 3px 0 rgba(255,255,255,.35),0 5px 0 #8a2c08}
.stl{flex:1}.stl b{display:block;font-family:Lalezar;font-weight:400;font-size:24px;line-height:1.1}.stl small{font-size:12px;font-weight:800;color:#ffe9d6}
.stag{display:inline-block;font-size:11px;font-weight:900;background:#fff;color:#ef5a1f;border-radius:8px;padding:0 8px}
.skins{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.skin,.cpk,.noads,.free{border-radius:18px;background:linear-gradient(180deg,#fffaf1,#f6e6cb);border:2.5px solid #e2b57a;box-shadow:0 4px 0 #a8743a;color:#5a3608;text-align:center;padding:4px 6px 8px;display:flex;flex-direction:column;align-items:center}
.skin svg{background:linear-gradient(180deg,#c88a50,#a0652f);border-radius:12px;margin-top:2px}
.skin b,.cpk b{font-size:13px;font-weight:900;margin:2px 0}
.own{font-size:12px;font-weight:900;color:#0d8a83;padding:4px 0}
.price{min-width:70px;height:30px;padding:0 10px;border-radius:12px;font-weight:900;font-size:14px;color:#fff;background:linear-gradient(180deg,#5fe0d6,#0d8a83);border:2px solid #075e59;box-shadow:0 3px 0 #064c48}
.price.pur{background:linear-gradient(180deg,#c7a6ff,#6a3be6);border-color:#4a1fb0;box-shadow:0 3px 0 #3a1690;display:flex;align-items:center;gap:4px;justify-content:center}
.price.big2{height:44px;font-size:18px;background:#fff;color:#ef5a1f;border-color:#fff;box-shadow:0 3px 0 #a8380c}
.coins{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.cpk{position:relative;padding-top:8px;justify-content:flex-end;height:112px}
.bonus{position:absolute;top:-8px;left:-4px;font-size:11px;font-weight:900;background:#22c25a;color:#fff;border-radius:8px;padding:0 6px;direction:ltr}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.noads,.free{padding:10px 8px;gap:3px}
.noads b,.free b{font-size:15px;font-weight:900}.noads small,.free small{font-size:11px;font-weight:700;color:#8a5a1a}
.trust{text-align:center;font-size:12px;font-weight:800;color:#ffe2b8;padding:6px;border-radius:12px;background:rgba(40,20,8,.6)}
'''

html = '<!doctype html><html lang="ar"><head><meta charset="utf-8"><style>%s</style></head><body>%s</body></html>' % (CSS, ''.join(frame(i + 1, t, b) for i, (t, b) in enumerate(SCREENS)))
open(OUT, 'w').write(html)
print('ok', len(SCREENS))
