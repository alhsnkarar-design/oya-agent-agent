# Abandoned-house restoration game mockups: 2.5D painted rooms + top-down puzzle screens, 390x844 phone frames.
import math

_src = open('/home/user/oya-agent-agent/design/house-robot/generate.py').read()
exec(_src[:_src.index('# ---------- hero')])          # robot(), tool(), icon(), sparkles()

OUT = '/home/user/oya-agent-agent/design/house-game/house-mockups.html'
W, H = 390, 844


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join('%02x' % round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def P(pts):
    return ' '.join('%.1f,%.1f' % p for p in pts)


def poly(pts, fill, stroke='none', sw=0, extra=''):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>' % (P(pts), fill, stroke, sw, extra)


# ---------- dollhouse room projection ----------
# back wall x 70..320, y 170..400 ; floor widens to x -60..450 at y 700
def F(u, v):
    hw = 125 + 130 * v
    return 195 + (u - .5) * 2 * hw, 400 + 300 * v


def K(v):
    return 1 + .35 * v


def up(p, h, v):
    return p[0], p[1] - h * K(v)


def box(u0, u1, v0, v1, h, col, tex=None, lift=0):
    b = [F(u0, v0), F(u1, v0), F(u1, v1), F(u0, v1)]
    b = [up(p, lift, vv) for p, vv in zip(b, [v0, v0, v1, v1])]
    t = [up(p, h, vv) for p, vv in zip(b, [v0, v0, v1, v1])]
    o = [poly([b[0], b[1], b[1], b[0]], 'none')]
    o.append('<polygon points="%s" fill="#000" opacity=".22" filter="url(#blur4)"/>' % P([F(u0 - .01, v1 + .02), F(u1 + .02, v1 + .02), F(u1 + .02, v0), F(u0 - .01, v0)]))
    cu = (u0 + u1) / 2
    if cu < .5:
        o.append(poly([b[1], b[2], t[2], t[1]], mix(col, '#000000', .28), mix(col, '#000000', .5), .8))
    elif cu > .5:
        o.append(poly([b[0], b[3], t[3], t[0]], mix(col, '#000000', .28), mix(col, '#000000', .5), .8))
    o.append(poly([b[3], b[2], t[2], t[3]], col, mix(col, '#000000', .5), .8))
    o.append(poly(t, mix(col, '#ffffff', .22), mix(col, '#000000', .45), .8))
    if tex:
        o.append('<polygon points="%s" fill="url(#%s)" opacity=".5"/>' % (P([b[3], b[2], t[2], t[3]]), tex))
        o.append('<polygon points="%s" fill="url(#%s)" opacity=".5"/>' % (P(t), tex))
    return ''.join(o)


def LW(v, h):          # point on the left wall
    return 70 - 130 * v, 400 + 300 * v - 230 * h


def RW(v, h):
    return 320 + 130 * v, 400 + 300 * v - 230 * h


DEFS = '''<defs>
<filter id="soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="blur4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .1  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="dirt" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="4" seed="11"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .24  0 0 0 0 .14  0 0 0 1.6 -.55"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<pattern id="woodtex" width="60" height="12" patternUnits="userSpaceOnUse"><path d="M0 3 Q15 1 30 4 T60 3 M0 9 Q18 7 34 10 T60 9" stroke="#3b200c" stroke-width=".8" fill="none" opacity=".55"/></pattern>
<pattern id="planks" width="40" height="300" patternUnits="userSpaceOnUse"><rect width="40" height="300" fill="none"/><line x1="0" y1="0" x2="0" y2="300" stroke="#3b200c" stroke-width="1.4" opacity=".45"/></pattern>
<pattern id="paperOld" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="none"/><path d="M13 3 l4 10 l-4 10 l-4 -10z" fill="#5d5a4a" opacity=".18"/></pattern>
<pattern id="paperNew" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="none"/><path d="M14 4 l5 10 l-5 10 l-5 -10z" fill="#ffffff" opacity=".35"/><circle cx="0" cy="0" r="2" fill="#fff" opacity=".4"/><circle cx="28" cy="28" r="2" fill="#fff" opacity=".4"/></pattern>
<linearGradient id="skyWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc6ee"/><stop offset=".62" stop-color="#cfeaf6"/><stop offset=".63" stop-color="#2f8fb6"/><stop offset="1" stop-color="#1c6a92"/></linearGradient>
<radialGradient id="fireGlow" cx=".5" cy=".8" r=".7"><stop offset="0" stop-color="#ffdd7a"/><stop offset=".4" stop-color="#ff8a2a" stop-opacity=".8"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="warm" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient>
<radialGradient id="vign" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a0604" stop-opacity=".75"/></radialGradient>
<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff5d6" stop-opacity=".45"/><stop offset="1" stop-color="#fff5d6" stop-opacity="0"/></linearGradient>
<linearGradient id="starG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7b0"/><stop offset=".5" stop-color="#ffd21f"/><stop offset="1" stop-color="#f29a00"/></linearGradient>
<linearGradient id="skyHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4e6"/><stop offset=".55" stop-color="#bfe3f3"/><stop offset="1" stop-color="#f7e3c4"/></linearGradient>
<linearGradient id="seaHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a9cc4"/><stop offset="1" stop-color="#14567a"/></linearGradient>
<linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fbf6a"/><stop offset=".12" stop-color="#6e9f4c"/><stop offset=".14" stop-color="#b48a5e"/><stop offset="1" stop-color="#7a5636"/></linearGradient>
</defs>'''


def wall_cracks():
    return ('<path d="M112 200 l10 22 l-6 14 l12 26 M286 360 l-8 -14 l6 -12 l-10 -18" stroke="#3a3328" stroke-width="1.6" fill="none" opacity=".7"/>'
            '<path d="%s" fill="#6d6352" opacity=".9"/>' % ('M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z' % (*LW(.2, .95), *LW(.45, .9), *LW(.38, .6), *LW(.22, .7))))


def cobweb(x, y, s=1, flip=1):
    o = ''
    for a in range(0, 91, 22):
        r = math.radians(a)
        o += '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#e8e4da" stroke-width=".8" opacity=".75"/>' % (x, y, x + flip * math.cos(r) * 46 * s, y + math.sin(r) * 46 * s)
    for rr in (14, 26, 38):
        pts = [(x + flip * math.cos(math.radians(a)) * rr * s, y + math.sin(math.radians(a)) * rr * s) for a in range(0, 91, 22)]
        o += '<polyline points="%s" fill="none" stroke="#e8e4da" stroke-width=".7" opacity=".7"/>' % P(pts)
    return o


def window(state):
    x, y, w, h = 196, 206, 96, 128
    o = ['<rect x="%d" y="%d" width="%d" height="%d" fill="url(#skyWin)"/>' % (x, y, w, h)]
    o.append('<path d="M%d %d q14 -8 28 0 q10 -6 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>' % (x + 14, y + 34))
    if state == 'before':
        o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#5d6d74" opacity=".55"/>' % (x, y, w, h))
        o.append('<path d="M%d %d l22 18 l-8 22 l30 10 M%d %d l-14 30" stroke="#e8f2f6" stroke-width="1.2" fill="none" opacity=".8"/>' % (x + 20, y + 14, x + 60, y + 60))
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="7"/>' % (x, y, w, h, '#6b5a45' if state == 'before' else '#fbf6ec'))
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="5"/><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="5"/>' % (x + w / 2, y, x + w / 2, y + h, '#6b5a45' if state == 'before' else '#fbf6ec', x, y + h / 2, x + w, y + h / 2, '#6b5a45' if state == 'before' else '#fbf6ec'))
    o.append('<rect x="%d" y="%d" width="%d" height="9" rx="2" fill="%s"/>' % (x - 8, y + h, w + 16, '#5a4a38' if state == 'before' else '#fffaf0'))
    if state == 'before':
        for i, (dy, a) in enumerate([(26, -8), (66, 6), (104, -4)]):
            o.append('<rect x="%d" y="%d" width="%d" height="15" rx="2" fill="#8a6a46" stroke="#4a3520" stroke-width="1" transform="rotate(%d %d %d)"/><circle cx="%d" cy="%d" r="1.6" fill="#333"/><circle cx="%d" cy="%d" r="1.6" fill="#333"/>' % (x - 10, y + dy, w + 20, a, x + w / 2, y + dy, x - 2, y + dy + 7, x + w + 2, y + dy + 7))
        o.append('<polygon points="%d,%d %d,%d 230,700 60,700" fill="url(#shaft)" opacity=".5"/>' % (x + 10, y + 50, x + 70, y + 80))
    else:
        o.append('<path d="M%d %d q-14 60 4 140 l-14 0 q-8 -80 0 -140z" fill="#f2c6a8"/><path d="M%d %d q14 60 -4 140 l14 0 q8 -80 0 -140z" fill="#f2c6a8"/>' % (x - 4, y - 8, x + w + 4, y - 8))
        o.append('<rect x="%d" y="%d" width="%d" height="8" rx="4" fill="#b98a5a"/>' % (x - 20, y - 14, w + 40))
    return ''.join(o)


def fireplace(state):
    x, y = 92, 290
    o = ['<rect x="%d" y="%d" width="92" height="110" fill="%s"/>' % (x, y, '#6d675e' if state == 'before' else '#d9cdb9')]
    for r in range(5):
        for c in range(4):
            o.append('<rect x="%d" y="%d" width="22" height="20" rx="3" fill="none" stroke="%s" stroke-width="1"/>' % (x + c * 23 + (r % 2) * 6 - 3, y + r * 22, '#4a453e' if state == 'before' else '#b9a98f'))
    o.append('<rect x="%d" y="%d" width="104" height="12" rx="3" fill="%s"/>' % (x - 6, y - 8, '#4a3f33' if state == 'before' else '#8a5a32'))
    o.append('<path d="M%d %d v-34 a24 24 0 0 1 48 0 v34z" fill="%s"/>' % (x + 22, y + 110, '#1d1a17'))
    if state == 'after':
        o.append('<ellipse cx="%d" cy="%d" rx="40" ry="34" fill="url(#fireGlow)"/>' % (x + 46, y + 92))
        o.append('<path d="M%d %d q-8 -14 2 -26 q2 12 8 6 q4 -10 -2 -20 q16 12 12 30 q6 -4 6 -12 q8 14 -4 22z" fill="#ffb02e"/><path d="M%d %d q-4 -8 2 -14 q4 8 6 2 q6 8 -2 12z" fill="#fff0a8"/>' % (x + 34, y + 108, x + 42, y + 108))
        o.append('<rect x="%d" y="%d" width="40" height="6" rx="3" fill="#6b4022"/>' % (x + 26, y + 104))
    else:
        o.append('<path d="M%d %d l10 -6 l12 4 l10 -5" stroke="#555" stroke-width="3" fill="none"/>' % (x + 30, y + 104))
    return ''.join(o)


def shelf_left(state):
    o = []
    a, b, c, d = LW(.18, .78), LW(.42, .78), LW(.42, .18), LW(.18, .18)
    o.append(poly([a, b, c, d], '#4a3424' if state == 'before' else '#7a4d2a', '#2a1c12', 1))
    for hh in (.33, .48, .63):
        p1, p2 = LW(.18, hh), LW(.42, hh)
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#2a1c12" stroke-width="3"/>' % (*p1, *p2))
    cols = ['#c44d3a', '#2f7fa8', '#e2b04a', '#3e8a5a', '#8a5ab0', '#d9774a'] if state == 'after' else ['#6a5b4c', '#5b5a52', '#71634f', '#5d554c']
    import random
    rnd = random.Random(4)
    for hh in (.18, .33, .48, .63):
        v = .2
        while v < .4:
            dv = .022 + rnd.random() * .012
            ht = .1 + rnd.random() * .03
            if state == 'before' and rnd.random() < .45:
                v += dv * 1.5
                continue
            p = [LW(v, hh), LW(v + dv, hh), LW(v + dv, hh + ht), LW(v, hh + ht)]
            o.append(poly(p, rnd.choice(cols), '#1a120c', .6))
            v += dv + .004
    return ''.join(o)


def painting_right(state):
    p = [RW(.12, .82), RW(.4, .82), RW(.4, .45), RW(.12, .45)]
    o = [poly(p, '#3b2a1d' if state == 'before' else '#c9a463', '#241811', 1.2)]
    q = [RW(.15, .78), RW(.37, .78), RW(.37, .49), RW(.15, .49)]
    if state == 'after':
        o.append(poly(q, '#9fd3ea'))
        o.append(poly([RW(.15, .6), RW(.37, .62), RW(.37, .49), RW(.15, .49)], '#2f86ad'))
        o.append(poly([RW(.24, .66), RW(.3, .66), RW(.28, .58), RW(.25, .58)], '#fff'))
    else:
        o.append(poly(q, '#5e5a52'))
        o.append(poly([RW(.15, .7), RW(.3, .78), RW(.37, .6), RW(.2, .52)], '#4a463f', extra='opacity=".6"'))
    return ''.join(o)


def rug(state):
    o = []
    outer = [F(.18, .56), F(.86, .56), F(.86, .93), F(.18, .93)]
    inner = [F(.23, .6), F(.81, .6), F(.81, .89), F(.23, .89)]
    if state == 'after':
        o.append(poly(outer, '#b8433a', '#7a2a24', 1))
        o.append(poly(inner, '#f1e3c4'))
        o.append(poly([F(.52, .62), F(.74, .745), F(.52, .87), F(.3, .745)], '#2f7f8a'))
        o.append(poly([F(.52, .67), F(.65, .745), F(.52, .82), F(.39, .745)], '#e2a33a'))
        o.append(poly([F(.52, .71), F(.58, .745), F(.52, .78), F(.46, .745)], '#b8433a'))
        for u in (.27, .77):
            o.append(poly([F(u, .66), F(u + .03, .745), F(u, .83), F(u - .03, .745)], '#2f7f8a'))
    else:
        o.append(poly(outer, '#6a4a3a', '#3a2a20', 1))
        o.append(poly(inner, '#8a7a62'))
        o.append(poly([F(.52, .62), F(.74, .745), F(.52, .87), F(.3, .745)], '#5a6058'))
        o.append('<polygon points="%s" fill="#5a4026" filter="url(#dirt)"/>' % P(outer))
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="30" ry="12" fill="#3a2614" opacity=".6"/>' % F(.35, .82))
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="18" ry="8" fill="#2a3a5a" opacity=".55"/>' % F(.7, .66))
    return ''.join(o)


def floor(state):
    pts = [F(0, 0), F(1, 0), F(1, 1), F(0, 1)]
    o = [poly(pts, '#7a5434' if state == 'before' else '#c08752')]
    for i in range(1, 12):
        u = i / 12
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#3b200c" stroke-width="1.1" opacity=".45"/>' % (*F(u, 0), *F(u, 1)))
    for v in (.2, .45, .72):
        for i in range(12):
            if (i + int(v * 10)) % 3 == 0:
                o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#3b200c" stroke-width="1" opacity=".35"/>' % (*F(i / 12, v), *F((i + 1) / 12, v)))
    o.append('<polygon points="%s" filter="url(#grain)" fill="#000"/>' % P(pts))
    if state == 'after':
        o.append('<polygon points="%s" fill="#fff" opacity=".08"/>' % P(pts))
    return ''.join(o)


def walls(state):
    back = [(70, 170), (320, 170), (320, 400), (70, 400)]
    left = [LW(0, 1), LW(0, 0), LW(1, 0), LW(1, 1)]
    right = [RW(0, 1), RW(0, 0), RW(1, 0), RW(1, 1)]
    base = '#7d8a7a' if state == 'before' else '#86c2b4'
    o = [poly([(-80, 0), (470, 0), (470, 170), (-80, 170)], '#3d342b' if state == 'before' else '#f4ead8')]
    o.append(poly(left, mix(base, '#000000', .22)))
    o.append(poly(right, mix(base, '#000000', .14)))
    o.append(poly(back, base))
    pat = 'paperOld' if state == 'before' else 'paperNew'
    for pp in (back, left, right):
        o.append('<polygon points="%s" fill="url(#%s)"/>' % (P(pp), pat))
    # skirting boards
    o.append(poly([(70, 388), (320, 388), (320, 400), (70, 400)], '#5a4632' if state == 'before' else '#fffaf0'))
    o.append(poly([LW(0, .05), LW(0, 0), LW(1, 0), LW(1, .05)], '#4e3d2c' if state == 'before' else '#efe6d6'))
    o.append(poly([RW(0, .05), RW(0, 0), RW(1, 0), RW(1, .05)], '#4e3d2c' if state == 'before' else '#efe6d6'))
    # crown line
    o.append('<line x1="70" y1="170" x2="320" y2="170" stroke="%s" stroke-width="6"/>' % ('#4a3f33' if state == 'before' else '#fffaf0'))
    return ''.join(o)


def clock(state):
    o = ['<circle cx="160" cy="230" r="20" fill="%s" stroke="%s" stroke-width="4"/>' % ('#c9c1b2' if state == 'before' else '#fffaf0', '#4a3f33' if state == 'before' else '#b07a3a')]
    for a in range(0, 360, 30):
        r = math.radians(a)
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#555" stroke-width="1.4"/>' % (160 + math.cos(r) * 14, 230 + math.sin(r) * 14, 160 + math.cos(r) * 17, 230 + math.sin(r) * 17))
    o.append('<line x1="160" y1="230" x2="160" y2="217" stroke="#333" stroke-width="2.4"/><line x1="160" y1="230" x2="%d" y2="%d" stroke="#333" stroke-width="2"/>' % ((170, 236) if state == 'after' else (152, 240)))
    return ''.join(o)


def sofa(state):
    if state == 'before':
        o = box(.3, .74, .44, .6, 34, '#7a7468')
        o += box(.3, .74, .44, .49, 70, '#7a7468')
        sheet = [up(F(.27, .44), 78, .44), up(F(.77, .44), 78, .44), up(F(.79, .62), 30, .62), F(.79, .64), F(.27, .64), up(F(.26, .6), 34, .6)]
        o += poly(sheet, '#b8b2a4', '#8a8478', 1, 'opacity=".95"')
        o += '<path d="M%.1f %.1f q20 30 6 60 M%.1f %.1f q-14 26 4 52" stroke="#8a8478" stroke-width="1.6" fill="none"/>' % (*up(F(.42, .46), 74, .46), *up(F(.62, .46), 74, .46))
        return o
    o = box(.3, .74, .44, .6, 30, '#2f8f8a', lift=4)
    o += box(.3, .74, .44, .49, 72, '#2a8580')
    o += box(.27, .32, .44, .6, 46, '#277a75')
    o += box(.72, .77, .44, .6, 46, '#277a75')
    o += box(.35, .5, .49, .55, 26, '#f2c46a', lift=30)
    o += box(.54, .69, .49, .55, 26, '#e98a6a', lift=30)
    return o


def table(state):
    col = '#5a4030' if state == 'before' else '#a8693a'
    o = box(.43, .63, .7, .78, 26, col, 'woodtex')
    if state == 'before':
        o += box(.48, .52, .71, .74, 14, '#9a958a', lift=26)
    else:
        o += box(.5, .54, .71, .74, 16, '#f7f3ea', lift=26)
        tp = up(F(.52, .725), 50, .725)
        o += '<circle cx="%.1f" cy="%.1f" r="9" fill="#5fae6a"/><circle cx="%.1f" cy="%.1f" r="6" fill="#7cc785"/>' % (tp[0], tp[1], tp[0] + 6, tp[1] - 4)
    return o


def armchair(state):
    col = '#6e6458' if state == 'before' else '#e2a33a'
    o = box(.8, .96, .6, .76, 28, col)
    o += box(.92, .96, .6, .76, 64, mix(col, '#000000', .1))
    if state == 'before':
        o += '<path d="M%.1f %.1f l8 6 l-4 8" stroke="#2a2420" stroke-width="2" fill="none"/>' % up(F(.86, .7), 28, .7)
    return o


def lamp(state):
    b = F(.1, .5)
    top = up(b, 150, .5)
    o = ['<ellipse cx="%.1f" cy="%.1f" rx="12" ry="4" fill="#2b2620"/>' % b,
         '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#2b2620" stroke-width="3"/>' % (b[0], b[1], top[0], top[1] + 10)]
    if state == 'after':
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="70" ry="60" fill="url(#warm)"/>' % (top[0], top[1] + 20))
        o.append('<path d="M%.1f %.1f h32 l-8 -28 h-16z" fill="#fff1c9" stroke="#d9b770" stroke-width="1.2"/>' % (top[0] - 16, top[1] + 12))
    else:
        o.append('<path d="M%.1f %.1f h32 l-8 -28 h-16z" fill="#8a826f" stroke="#555" stroke-width="1.2" transform="rotate(18 %.1f %.1f)"/>' % (top[0] - 16, top[1] + 12, top[0], top[1]))
    return ''.join(o)


def plants():
    o = ''
    for u, v, s in [(.94, .9, 1.1), (.05, .9, 1)]:
        b = F(u, v)
        o += box(u - .04, u + .04, v - .04, v, 36 * s, '#c96f4a')
        tp = up(b, 36 * s, v)
        for a in (-60, -30, 0, 30, 60):
            r = math.radians(a - 90)
            o += '<path d="M%.1f %.1f q%.1f %.1f %.1f %.1f q%.1f %.1f %.1f %.1f z" fill="%s"/>' % (tp[0], tp[1], math.cos(r) * 20 - 6, math.sin(r) * 30, math.cos(r) * 34 * s, math.sin(r) * 46 * s, math.cos(r) * 4 + 8, math.sin(r) * 10, -math.cos(r) * 34 * s, -math.sin(r) * 46 * s, '#3f8f4f' if a % 60 else '#5fae6a')
    return o


def debris():
    o = box(.06, .16, .76, .86, 40, '#8a6a46', 'woodtex')
    o += box(.08, .15, .78, .84, 30, '#7a5c3c', 'woodtex', lift=40)
    o += box(.66, .74, .9, .97, 18, '#6d6458')
    o += '<ellipse cx="%.1f" cy="%.1f" rx="34" ry="9" fill="#5a7b8a" opacity=".55"/>' % F(.6, .52)
    o += '<path d="M%.1f 170 v8 m0 14 v6 m0 14 v4" stroke="#8ab4c6" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>' % F(.6, .52)[0]
    o += ''.join('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#b8ad98" opacity=".5"/>' % (x, y, r) for x, y, r in [(150, 640, 3), (300, 610, 2), (90, 560, 2.5), (250, 680, 3), (330, 520, 2)])
    return o


def room(state):
    o = [walls(state), floor(state), window(state), fireplace(state), clock(state), shelf_left(state), painting_right(state), rug(state)]
    if state == 'before':
        o += [wall_cracks(), cobweb(70, 170, 1, 1), cobweb(320, 170, .9, -1)]
    o += [lamp(state), sofa(state), table(state), armchair(state)]
    o.append(debris() if state == 'before' else plants())
    if state == 'before':
        o.append('<rect x="-80" y="0" width="550" height="844" fill="#3a3a44" opacity=".22"/>')
    else:
        o.append('<rect x="-80" y="0" width="550" height="844" fill="#ffd28a" opacity=".07"/>')
    return ''.join(o)


def marker(x, y, emo, n=None):
    badge = '<g transform="translate(%d %d)"><circle r="10" fill="#ff5a3c" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="Cairo">%s</text></g>' % (x + 18, y - 18, n) if n else ''
    return ('<g><path d="M%d %d l-7 -10 h14z" fill="#fff"/><circle cx="%d" cy="%d" r="22" fill="#fff" stroke="#14a39b" stroke-width="3"/>'
            '<text x="%d" y="%d" text-anchor="middle" font-size="22">%s</text>%s</g>' % (x, y + 30, x, y, x, y + 8, emo, badge))


def coin(sz=22):
    return '<svg width="%d" height="%d" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#ffc72c" stroke="#b97700" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="none" stroke="#e59a00" stroke-width="1.4"/><rect x="10" y="7.5" width="4" height="9" rx="1" fill="#e59a00"/><circle cx="9" cy="8" r="2" fill="#fff" opacity=".6"/></svg>' % (sz, sz)


def star(sz, on=True):
    return '<svg width="%d" height="%d" viewBox="0 0 24 24"><polygon points="12 1.5 15.2 8.3 22.5 9.2 17.1 14.2 18.6 21.6 12 17.9 5.4 21.6 6.9 14.2 1.5 9.2 8.8 8.3" fill="%s" stroke="%s" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 8.6 L12 3.8 L13.6 7.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/></svg>' % (sz, sz, 'url(#starG)' if on else '#cdbfae', '#b86b00' if on else '#a8988a')


ICON = {
    'gear': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    'back': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>',
    'pause': '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>',
    'undo': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    'bulb': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    'rotate': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    'cart': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6"/></svg>',
    'home': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
    'map': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    'book': '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-1 .2V20a2 2 0 0 1 2-2h5z"/></svg>',
    'film': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    'camera': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    'lock': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    'play': '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>',
}


def bot(x, y, s=.42, **kw):
    return '<svg class="bot" style="left:%dpx;top:%dpx" width="%d" height="%d" viewBox="0 0 220 220">%s</svg>' % (x, y, 220 * s * 1.25, 220 * s * 1.25, robot(110, 150, 1.0, **kw))


# ---------- tools are the main companion; the robot is an optional extra ----------
TB = {'classic': ('#c0392b', '#8e2a1f', '#d9a46d'), 'brass': ('#c9a24a', '#8a6a22', '#3b2a1d'), 'teal': ('#14a39b', '#0b7570', '#f2c46a')}


def toolbox_svg(skin='classic', w=120):
    c1, c2, c3 = TB[skin]
    inner = ('<ellipse cx="60" cy="96" rx="54" ry="8" fill="#000" opacity=".25"/>'
             '<g transform="translate(30 6) rotate(-18)"><rect x="-3" y="0" width="6" height="40" rx="2" fill="#c08a55"/><rect x="-12" y="-4" width="24" height="10" rx="3" fill="#7d8b98"/></g>'
             '<g transform="translate(58 2) rotate(8)"><rect x="-4" y="0" width="8" height="16" rx="3" fill="#ff7a59"/><rect x="-1.5" y="15" width="3" height="26" fill="#a9b6c2"/></g>'
             '<g transform="translate(86 10) rotate(20)"><rect x="-3" y="0" width="6" height="30" rx="2" fill="#c08a55"/><rect x="-8" y="26" width="16" height="7" rx="2" fill="#3b4a5a"/>'
             + ''.join('<line x1="%d" y1="33" x2="%d" y2="42" stroke="#e7c27a" stroke-width="2"/>' % (i, i) for i in range(-6, 8, 3)) + '</g>'
             '<path d="M34 40 v-12 a6 6 0 0 1 6 -6 h40 a6 6 0 0 1 6 6 v12" fill="none" stroke="%s" stroke-width="6"/>'
             '<rect x="8" y="38" width="104" height="56" rx="8" fill="%s"/><rect x="8" y="38" width="104" height="14" rx="6" fill="%s"/>'
             '<rect x="8" y="64" width="104" height="5" fill="%s" opacity=".6"/><rect x="50" y="56" width="20" height="12" rx="3" fill="%s"/>'
             '<rect x="14" y="42" width="40" height="4" rx="2" fill="#fff" opacity=".35"/>') % (c2, c1, mix(c1, '#ffffff', .2), c2, c3)
    return '<svg width="%d" height="%d" viewBox="0 0 120 104">%s</svg>' % (w, w * 104 / 120, inner)


def toolbox(x, y, w=110, skin='classic'):
    return '<div class="bot" style="left:%dpx;top:%dpx">%s</div>' % (x, y, toolbox_svg(skin, w))


def tool_cursor(x, y, name, s=2.2, label=None):
    lab = '<span class="tlab">%s</span>' % label if label else ''
    return '<div class="tcur" style="left:%dpx;top:%dpx"><svg width="%d" height="%d" viewBox="-30 -30 60 60">%s</svg>%s</div>' % (x, y, 60 * s / 1.6, 60 * s / 1.6, tool(name, 0, 0, s / 1.6), lab)


def saw_svg():
    return ('<svg width="84" height="50" viewBox="0 0 84 50"><path d="M4 30 L60 12 L64 26 L8 44z" fill="#cfd8df" stroke="#7d8b98" stroke-width="1.5"/>'
            + ''.join('<path d="M%d %d l3 6 l3 -7" fill="none" stroke="#7d8b98" stroke-width="1.2"/>' % (8 + i * 6, 43 - i * 2) for i in range(9)) +
            '<path d="M58 8 h16 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-10z" fill="#c0392b"/><rect x="66" y="16" width="8" height="10" rx="3" fill="#7a1f16"/></svg>')


def can_svg():
    return ('<svg width="80" height="62" viewBox="0 0 80 62"><path d="M20 18 h30 l4 38 h-38z" fill="#3fa36a"/><path d="M20 18 h30 l1 8 h-32z" fill="#5fc488"/>'
            '<path d="M50 30 L74 12 l4 4 L54 38z" fill="#3fa36a"/><ellipse cx="76" cy="13" rx="4" ry="6" fill="#2f8a56" transform="rotate(40 76 13)"/>'
            '<path d="M22 18 q14 -22 28 0" fill="none" stroke="#2f8a56" stroke-width="4"/>'
            '<circle cx="74" cy="26" r="1.8" fill="#9fdcff"/><circle cx="78" cy="32" r="1.5" fill="#9fdcff"/><circle cx="70" cy="34" r="1.4" fill="#9fdcff"/></svg>')


def nav(on):
    items = [('cart', 'المتجر'), ('book', 'الدفتر'), ('home', 'البيت'), ('map', 'المناطق')]
    return '<nav class="nav">%s</nav>' % ''.join('<button class="%s">%s<span>%s</span></button>' % ('on' if t == on else '', ICON[k], t) for k, t in items)


def topbar(right_btn=True, coins='2,450', stars='38'):
    return '<div class="top"><div class="res">%s<b>%s</b><i>+</i></div><div class="res">%s<b>%s</b></div>%s</div>' % (coin(), coins, star(20), stars, '<button class="rbtn ml">%s</button>' % ICON['gear'] if right_btn else '')


# =============== 1. HOME: house on the cliff ===============
def house_ext():
    o = ['<rect width="390" height="844" fill="url(#skyHome)"/>']
    o.append('<circle cx="300" cy="150" r="46" fill="#fff4cf" opacity=".85"/><circle cx="300" cy="150" r="90" fill="#fff4cf" opacity=".25"/>')
    for x, y, w in [(30, 120, 90), (210, 90, 70), (120, 200, 60)]:
        o.append('<ellipse cx="%d" cy="%d" rx="%d" ry="14" fill="#fff" opacity=".8"/><ellipse cx="%d" cy="%d" rx="%d" ry="18" fill="#fff" opacity=".8"/>' % (x, y, w / 2, x + 14, y - 8, w / 3))
    o.append('<rect x="0" y="380" width="390" height="464" fill="url(#seaHome)"/>')
    o.append(''.join('<path d="M%d %d q10 -5 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".45"/>' % (x, y) for x, y in [(30, 420), (200, 400), (320, 440), (90, 470), (260, 500), (20, 530)]))
    # lighthouse rock + tower (dark, unrestored)
    o.append('<path d="M300 520 q20 -40 60 -40 q30 0 40 40 z" fill="#5d4a3a"/>')
    o.append('<path d="M330 486 l8 -150 h20 l8 150z" fill="#d9d3c7"/><path d="M332 450 h32 l-1 -22 h-30z M335 400 h26 l-1 -20 h-24z" fill="#b8473a"/>')
    o.append('<rect x="334" y="318" width="28" height="20" rx="3" fill="#3b4652"/><path d="M330 318 l18 -16 l18 16z" fill="#2b3640"/>')
    # cliff
    o.append('<path d="M-10 520 q40 -30 110 -36 q120 -10 190 20 q40 20 40 60 L330 844 H-10z" fill="url(#cliff)"/>')
    o.append('<path d="M-10 498 q60 -24 140 -26 q100 -2 170 22 q20 8 30 20 l-4 14 q-40 -26 -150 -30 q-100 0 -190 30z" fill="#7fb35a"/>')
    # house: main block
    hx, hy = 60, 330
    o.append('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#e9dcc6"/>' % (hx, hy + 150, hx + 170, hy + 150, hx + 170, hy + 40, hx, hy + 40))
    o.append('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#b8a888"/>' % (hx, hy + 150, hx, hy + 40, hx + 85, hy + 40, hx + 85, hy + 150))  # left half weathered
    o.append('<polygon points="%d,%d %d,%d %d,%d" fill="#7a3f30"/><polygon points="%d,%d %d,%d %d,%d" fill="#5b5048"/>' % (hx + 85, hy - 40, hx + 182, hy + 46, hx + 85, hy + 46, hx + 85, hy - 40, hx - 12, hy + 46, hx + 85, hy + 46))
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#3a2a20" stroke-width="4"/>' % (hx - 12, hy + 46, hx + 182, hy + 46))
    # side wing
    o.append('<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#d6c8b0"/>' % (hx + 170, hy + 150, hx + 245, hy + 150, hx + 245, hy + 80, hx + 170, hy + 80))
    o.append('<polygon points="%d,%d %d,%d %d,%d" fill="#8a4a38"/>' % (hx + 165, hy + 82, hx + 250, hy + 82, hx + 207, hy + 46))
    # chimney
    o.append('<rect x="%d" y="%d" width="16" height="36" fill="#7a6a5a"/>' % (hx + 130, hy - 14))
    # windows: restored (right) vs boarded (left)
    for wx, wy, ok in [(hx + 14, hy + 60, False), (hx + 52, hy + 60, False), (hx + 100, hy + 60, True), (hx + 138, hy + 60, True), (hx + 14, hy + 104, False), (hx + 186, hy + 98, True), (hx + 216, hy + 98, False)]:
        if ok:
            o.append('<rect x="%d" y="%d" width="24" height="30" fill="#ffe08a"/><rect x="%d" y="%d" width="24" height="30" fill="none" stroke="#fffaf0" stroke-width="3"/><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#fffaf0" stroke-width="2"/><rect x="%d" y="%d" width="30" height="5" fill="#fffaf0"/>' % (wx, wy, wx, wy, wx + 12, wy, wx + 12, wy + 30, wx - 3, wy + 30))
            o.append('<circle cx="%d" cy="%d" r="18" fill="#ffd36a" opacity=".25"/>' % (wx + 12, wy + 15))
        else:
            o.append('<rect x="%d" y="%d" width="24" height="30" fill="#3d4a52"/><rect x="%d" y="%d" width="30" height="6" fill="#8a6a46" transform="rotate(-10 %d %d)"/><rect x="%d" y="%d" width="30" height="6" fill="#7a5c3c" transform="rotate(8 %d %d)"/>' % (wx, wy, wx - 3, wy + 6, wx + 12, wy + 9, wx - 3, wy + 18, wx + 12, wy + 21))
    # door + porch
    o.append('<rect x="%d" y="%d" width="28" height="46" rx="3" fill="#2f7f8a"/><circle cx="%d" cy="%d" r="2" fill="#ffd36a"/>' % (hx + 70, hy + 104, hx + 92, hy + 128))
    o.append('<rect x="%d" y="%d" width="70" height="8" fill="#a8835a"/><rect x="%d" y="%d" width="80" height="6" fill="#8a6a46"/>' % (hx + 49, hy + 150, hx + 44, hy + 158))
    # overgrown garden left vs neat right
    o.append(''.join('<ellipse cx="%d" cy="%d" rx="%d" ry="%d" fill="%s"/>' % (x, y, rx, ry, c) for x, y, rx, ry, c in [(40, 488, 30, 22, '#4f7a38'), (70, 478, 24, 26, '#5d8a42'), (20, 470, 20, 18, '#3f6a2e'), (100, 492, 22, 14, '#567f3c')]))
    o.append(''.join('<circle cx="%d" cy="%d" r="9" fill="#3f8f4f"/><circle cx="%d" cy="%d" r="3" fill="%s"/>' % (x, y, x + 3, y - 4, c) for x, y, c in [(220, 488, '#ff8aa0'), (246, 490, '#ffd36a'), (272, 488, '#ff8aa0'), (298, 492, '#fff')]))
    o.append('<path d="M138 488 q10 40 -20 120 h40 q20 -70 6 -120z" fill="#d9c49a"/>')
    return ''.join(o)


home = ('<svg class="bg" viewBox="0 0 390 844">%s%s<rect width="390" height="844" fill="url(#vign)" opacity=".35"/></svg>' % (DEFS, house_ext()) + topbar()
        + '<div class="logo"><div class="lg1">البيت</div><div class="lg2">المهجور</div><div class="lgs">اسم مؤقت · رمّم · اكتشف · أضِئ</div></div>'
        + toolbox(196, 472, 96)
        + '<div class="prog"><div class="pr-t"><b>البيت</b><span class="ltr">34%</span></div><div class="bar"><i style="width:34%"></i></div></div>'
        + '<div class="homeact"><button class="big">%s تابع <small>الصالة · المهمة 4</small></button></div>' % ICON['play'] + nav('البيت'))

# =============== 2. ROOM BEFORE ===============
before = ('<svg class="bg" viewBox="-0 0 390 844"><svg x="0" y="60" width="390" height="640" viewBox="-40 120 470 600" preserveAspectRatio="xMidYMid slice">%s%s'
          '<rect x="-80" y="0" width="550" height="844" fill="url(#vign)"/>%s%s%s%s%s</svg></svg>'
          % (DEFS, room('before'), marker(*F(.52, .74), '🧽', 1)[0:0] + marker(F(.52, .74)[0], F(.52, .74)[1] - 30, '🧽', 1),
             marker(244, 250, '🔨', 2), marker(F(.52, .5)[0], F(.52, .5)[1] - 90, '🪡', 3), marker(138, 330, '🔧', 4), marker(*LW(.3, .9), '🖌️', 5))
          + '<div class="hud"><button class="rbtn">%s</button><div class="ttl"><small>المنطقة 2</small><b>الصالة</b></div><div class="res">%s<b>2,450</b></div></div>' % (ICON['back'], coin())
          + '<div class="beforetag">قبل</div>'
          + toolbox(8, 628, 100)
          + '<div class="speech"><b>📒 من دفتر البيت</b>السجادة مغطاة بالطين والبقع… اضغط عليها للبدء</div>'
          + '<div class="tasks"><div class="tk on"><span>🧽</span><b>اغسل السجادة</b><em>⭐ 1</em></div><div class="tk"><span>🔨</span><b>افتح النافذة</b><em>⭐ 1</em></div><div class="tk"><span>🪡</span><b>رمّم الأريكة</b><em>⭐ 2</em></div><div class="tk lock"><span>🔧</span><b>أصلح المدفأة</b><em>%s</em></div></div>' % ICON['lock'])

# =============== 3. ROOM AFTER ===============
after = ('<svg class="bg" viewBox="0 0 390 844"><svg x="0" y="60" width="390" height="640" viewBox="-40 120 470 600" preserveAspectRatio="xMidYMid slice">%s%s'
         '<rect x="-80" y="0" width="550" height="844" fill="url(#vign)" opacity=".55"/></svg></svg>' % (DEFS, room('after'))
         + '<div class="hud"><button class="rbtn">%s</button><div class="ttl"><small>المنطقة 2</small><b>الصالة</b></div><div class="res">%s<b>3,180</b></div></div>' % (ICON['back'], coin())
         + '<div class="aftertag">بعد ✨</div>'
         + toolbox(8, 604, 96, 'teal')
         + '<div class="done"><div class="dn-t"><b>اكتملت الصالة!</b><span>انفتح سر جديد في المكتبة 🔑</span></div>'
           '<div class="styles"><span>الطراز:</span><i class="on" style="--c:#2f8f8a">ساحلي</i><i style="--c:#a8693a">كلاسيكي</i><i style="--c:#555">عصري</i></div>'
           '<div class="dn-b"><button class="big blue small2">%s صوّر قبل/بعد</button><button class="big small2">المنطقة التالية</button></div></div>' % ICON['camera'])

# =============== 4. RUG PUZZLE ===============
def rug_top(x, y, w, h, clean_frac=.45):
    o = ['<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#b8433a"/>' % (x, y, w, h)]
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#f1e3c4"/>' % (x + 14, y + 14, w - 28, h - 28))
    cx, cy = x + w / 2, y + h / 2
    for s, c in [(1, '#2f7f8a'), (.72, '#e2a33a'), (.42, '#b8433a'), (.18, '#f1e3c4')]:
        o.append('<polygon points="%s" fill="%s"/>' % (P([(cx, cy - h * .36 * s), (cx + w * .34 * s, cy), (cx, cy + h * .36 * s), (cx - w * .34 * s, cy)]), c))
    for yy in (y + 40, y + h - 40):
        for xx in (x + 40, x + w - 40):
            o.append('<polygon points="%s" fill="#2f7f8a"/><polygon points="%s" fill="#e2a33a"/>' % (P([(xx, yy - 16), (xx + 16, yy), (xx, yy + 16), (xx - 16, yy)]), P([(xx, yy - 7), (xx + 7, yy), (xx, yy + 7), (xx - 7, yy)])))
    o.append(''.join('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#f1e3c4" stroke-width="2" stroke-dasharray="3 4"/>' % (x + i, y + 6, x + i, y + h - 6) for i in (6, w - 6)))
    o.append(''.join('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#d9c7a2" stroke-width="1.6"/>' % (x + i * 4, y + h, x + i * 4, y + h + 10) for i in range(1, w // 4)))
    o.append(''.join('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#d9c7a2" stroke-width="1.6"/>' % (x + i * 4, y - 10, x + i * 4, y) for i in range(1, w // 4)))
    o.append('<rect x="%d" y="%d" width="%d" height="%d" filter="url(#grain)" fill="#000"/>' % (x, y, w, h))
    # mud on the uncleaned part
    my = y + h * clean_frac
    o.append('<clipPath id="mudclip"><path d="M%d %d %s V%d H%d Z"/></clipPath>' % (x, my, ' '.join('Q%d %d %d %d' % (x + i * 30 + 15, my + (10 if i % 2 else -10), x + (i + 1) * 30, my) for i in range(w // 30 + 1)), y + h, x))
    o.append('<g clip-path="url(#mudclip)"><rect x="%d" y="%d" width="%d" height="%d" fill="#6a4a2c" opacity=".88"/><rect x="%d" y="%d" width="%d" height="%d" fill="#4a3018" filter="url(#dirt)"/></g>' % (x, y, w, h, x, y, w, h))
    # stains
    def blob(bx, by, r, col):
        pts = [(bx + math.cos(a / 8 * 2 * math.pi) * r * (1 + .25 * math.sin(a * 2.3)), by + math.sin(a / 8 * 2 * math.pi) * r * .8 * (1 + .25 * math.cos(a * 1.7))) for a in range(8)]
        return '<path d="M%.1f %.1f %s Z" fill="%s" opacity=".85"/>' % (pts[0][0], pts[0][1], ' '.join('Q%.1f %.1f %.1f %.1f' % (pts[i][0] + 4, pts[i][1] - 3, (pts[i][0] + pts[(i + 1) % 8][0]) / 2, (pts[i][1] + pts[(i + 1) % 8][1]) / 2) for i in range(8)), col)
    o.append(blob(x + 70, y + 64, 20, '#6b3a17'))
    o.append(blob(x + w - 66, y + 92, 15, '#2a3f8a'))
    o.append(blob(x + w - 90, y + h - 80, 22, '#b4581e'))
    # labels
    for lx, ly, t in [(x + 70, y + 64, 'قهوة'), (x + w - 66, y + 92, 'حبر'), (x + w - 90, y + h - 80, 'صدأ')]:
        o.append('<g transform="translate(%d %d)"><rect x="-22" y="-34" width="44" height="18" rx="9" fill="#fff" stroke="#c9b48c"/><text y="-21" text-anchor="middle" font-family="Cairo" font-size="11" font-weight="900" fill="#5a3a18">%s</text></g>' % (lx, ly, t))
    # clean shine strip
    o.append('<rect x="%d" y="%d" width="%d" height="6" fill="#fff" opacity=".35"/>' % (x, my - 18, w))
    return ''.join(o)


def bottle(col, label, cnt, sel=False, emo=''):
    return ('<div class="btl%s"><svg width="46" height="62" viewBox="0 0 46 62"><rect x="17" y="2" width="12" height="10" rx="2" fill="#3b4a5a"/><rect x="8" y="12" width="30" height="46" rx="9" fill="%s"/><rect x="12" y="26" width="22" height="18" rx="4" fill="#fff" opacity=".9"/><text x="23" y="40" text-anchor="middle" font-size="12">%s</text><rect x="11" y="15" width="6" height="30" rx="3" fill="#fff" opacity=".35"/></svg><b>%s</b><span class="cnt">×%d</span></div>'
            % (' sel' if sel else '', col, emo, label, cnt))


rug_scr = ('<div class="pz-bg"></div><svg class="bg" viewBox="0 0 390 844">%s<rect x="20" y="160" width="350" height="412" rx="18" fill="#7a5434"/><rect x="20" y="160" width="350" height="412" rx="18" fill="url(#planks)"/>%s'
           '<g transform="translate(250 330)"><circle r="30" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="5 4"/></g>'
           '<g opacity=".9">%s</g></svg>' % (DEFS, rug_top(52, 188, 286, 356, .42), ''.join('<circle cx="%d" cy="%d" r="%d" fill="#e9f8ff" stroke="#a7d8ef" stroke-width="1.2"/>' % (x, y, r) for x, y, r in [(236, 318, 7), (262, 336, 5), (248, 346, 4), (272, 316, 4), (228, 340, 3)]))
           + '<div class="hud"><button class="rbtn">%s</button><div class="ttl"><small>الصالة · غسيل السجادة</small><b>كيمياء البقع</b></div><div class="goal"><small>النظافة</small><b class="ltr">58%%</b><div class="mini"><i style="width:58%%"></i></div></div></div>' % ICON['pause']
           + '<div class="steps"><i class="ok">كنس ✓</i><i class="on">بقع</i><i>غسل</i><i>شطف</i><i>تجفيف</i></div>'
           + tool_cursor(276, 262, 'spray', 2.6, 'منظّف الحبر')
           + '<div class="hint">💡 الحبر لا يُزال بالماء وحده… جرّب منظّفاً آخر</div>'
           + '<div class="tray"><div class="btls">%s%s%s%s%s</div><div class="actrow"><button class="sq">%s</button><button class="sq">%s</button><div class="stars3">%s%s%s</div></div></div>'
           % (bottle('#4dc3ff', 'ماء دافئ', 9), bottle('#ffb84d', 'صابون لطيف', 3), bottle('#9b7bff', 'منظّف الحبر', 2, True), bottle('#5fe08a', 'بيكربونات', 2), bottle('#ff7a59', 'مزيل الصدأ', 1),
              ICON['undo'], ICON['bulb'], star(26), star(26), star(26, False)))

# =============== 5. WOOD CUT PUZZLE ===============
def board(x, y, cols, rows, cell, placed, ghost=None, waste_cells=()):
    o = ['<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#d9a46d"/>' % (x, y, cols * cell, rows * cell)]
    o.append('<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="url(#woodtex)"/>' % (x, y, cols * cell, rows * cell))
    for c in range(1, cols):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#8a5a32" stroke-width="1" stroke-dasharray="3 4" opacity=".55"/>' % (x + c * cell, y, x + c * cell, y + rows * cell))
    for r in range(1, rows):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#8a5a32" stroke-width="1" stroke-dasharray="3 4" opacity=".55"/>' % (x, y + r * cell, x + cols * cell, y + r * cell))
    o.append('<ellipse cx="%d" cy="%d" rx="12" ry="7" fill="#7a4a22" opacity=".8"/><ellipse cx="%d" cy="%d" rx="6" ry="3.5" fill="#5a3416"/>' % (x + 5.5 * cell, y + 2.5 * cell, x + 5.5 * cell, y + 2.5 * cell))
    for cells, col, lab in placed:
        for (cx, cy) in cells:
            o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" opacity=".9"/>' % (x + cx * cell + 1, y + cy * cell + 1, cell - 2, cell - 2, col))
        xs = [c[0] for c in cells]; ys = [c[1] for c in cells]
        o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="#fff" stroke-width="2.5" rx="3"/>' % (x + min(xs) * cell + 2, y + min(ys) * cell + 2, (max(xs) - min(xs) + 1) * cell - 4, (max(ys) - min(ys) + 1) * cell - 4))
        o.append('<text x="%d" y="%d" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="12" fill="#fff">%s</text>' % (x + (min(xs) + max(xs) + 1) * cell / 2, y + (min(ys) + max(ys) + 1) * cell / 2 + 4, lab))
    if ghost:
        cells, lab = ghost
        for (cx, cy) in cells:
            o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#fff" opacity=".35" stroke="#fff" stroke-dasharray="4 3"/>' % (x + cx * cell + 1, y + cy * cell + 1, cell - 2, cell - 2))
    for (cx, cy) in waste_cells:
        o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#ff5a3c" opacity=".25"/>' % (x + cx * cell + 1, y + cy * cell + 1, cell - 2, cell - 2))
    return ''.join(o)


def piece_svg(shape, col, lab, cell=13):
    xs = [c[0] for c in shape]; ys = [c[1] for c in shape]
    w, h = (max(xs) + 1) * cell, (max(ys) + 1) * cell
    inner = ''.join('<rect x="%d" y="%d" width="%d" height="%d" rx="2" fill="%s" stroke="#5a3416" stroke-width=".8"/>' % (cx * cell, cy * cell, cell - 1, cell - 1, col) for cx, cy in shape)
    return '<div class="pc"><svg width="%d" height="%d" viewBox="-2 -2 %d %d">%s</svg><b>%s</b></div>' % (w + 4, h + 4, w + 4, h + 4, inner, lab)


cell = 38
leg = [(0, 0), (0, 1), (0, 2)]
wood_scr = ('<div class="pz-bg wood"></div><svg class="bg" viewBox="0 0 390 844">%s'
            '<text x="195" y="186" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="14" fill="#fff" opacity=".9">لوح الجوز · 9 × 5</text>%s'
            '<g transform="translate(18 470)"><rect width="354" height="96" rx="16" fill="#fffaf0" opacity=".95"/>'
            '<text x="336" y="24" text-anchor="start" font-family="Cairo" font-weight="900" font-size="13" fill="#5a3a18">الهدف: طاولة قهوة</text>'
            '<g transform="translate(40 18)"><polygon points="20,30 140,30 160,46 40,46" fill="#c88a52"/><polygon points="40,46 160,46 160,52 40,52" fill="#8a5a32"/><rect x="46" y="52" width="7" height="30" fill="#8a5a32"/><rect x="148" y="52" width="7" height="30" fill="#8a5a32"/><rect x="28" y="36" width="6" height="34" fill="#a8693a"/><rect x="132" y="36" width="6" height="34" fill="#a8693a"/></g>'
            '<text x="336" y="50" text-anchor="start" font-family="Cairo" font-weight="700" font-size="12" fill="#8a5a1a">سطح + 4 أرجل + رف</text><text x="336" y="72" text-anchor="start" font-family="Cairo" font-weight="700" font-size="12" fill="#c44d3a">تجنّب العقدة في الخشب ●</text></g></svg>'
            % (DEFS, board(24, 200, 9, 5, cell, [([(c, r) for c in range(0, 5) for r in range(0, 2)], '#b8743a', 'السطح'), (leg, '#8a5a32', 'رجل'), ([(1, 2), (1, 3), (1, 4)], '#8a5a32', 'رجل')],
                           ghost=([(6, 0), (7, 0), (8, 0), (6, 1), (7, 1), (8, 1)], 'رف'), waste_cells=[(5, 2)]))
            + '<div class="hud"><button class="rbtn">%s</button><div class="ttl"><small>الورشة · النجارة</small><b>خطّط القصّ</b></div><div class="goal"><small>الهدر</small><b class="ltr">7%%</b><div class="mini green"><i style="width:22%%"></i></div></div></div>' % ICON['pause']
            + '<div class="bot" style="left:290px;top:396px">%s</div>' % saw_svg()
            + '<div class="tray"><div class="pieces">%s%s%s%s</div><div class="actrow"><button class="sq">%s</button><button class="sq">%s</button><button class="big push">قصّ 🪚</button></div></div>'
            % (piece_svg([(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1)], '#c88a52', 'رف ×1'), piece_svg([(0, 0), (0, 1), (0, 2)], '#a8693a', 'رجل ×2'),
               piece_svg([(0, 0), (1, 0), (2, 0), (3, 0)], '#d9a46d', 'إطار ×1'), piece_svg([(0, 0), (1, 0), (1, 1)], '#b8743a', 'زاوية ×1'), ICON['rotate'], ICON['undo']))

# =============== 6. GARDEN PUZZLE ===============
G = 6
gcell = 50
garden = []
gx0, gy0 = 45, 188
for r in range(G):
    for c in range(G):
        shade = (c >= 3 and r <= 2)
        base = '#7fb35a' if not shade else '#5f8f48'
        garden.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="#5a8a3c" stroke-width="1"/>' % (gx0 + c * gcell, gy0 + r * gcell, gcell, gcell, base))
garden.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#1d3a20" opacity=".22"/>' % (gx0 + 3 * gcell, gy0, 3 * gcell, 3 * gcell))
garden.append('<g transform="translate(%d %d)"><circle r="16" fill="#2b4a2e"/><path d="M-8 4 q8 -16 16 0z" fill="#9ccf7a"/></g>' % (gx0 + 6 * gcell - 12, gy0 + 14))
garden.append('<g transform="translate(%d %d)"><circle r="18" fill="#ffd84a"/><circle r="26" fill="#ffd84a" opacity=".3"/></g>' % (gx0 + 18, gy0 + 18))
# water channel
garden.append('<path d="M%d %d H%d V%d H%d" stroke="#4dc3ff" stroke-width="12" fill="none" stroke-linejoin="round" opacity=".9"/><path d="M%d %d H%d V%d H%d" stroke="#bfe9ff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-dasharray="6 8"/>'
              % (gx0, gy0 + 3.5 * gcell, gx0 + 2.5 * gcell, gy0 + 5.5 * gcell, gx0 + 6 * gcell, gx0, gy0 + 3.5 * gcell, gx0 + 2.5 * gcell, gy0 + 5.5 * gcell, gx0 + 6 * gcell))
# path stones
for c, r in [(0, 0), (1, 0), (1, 1), (1, 2), (2, 2)]:
    garden.append('<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="#d9c49a" stroke="#b8a070"/>' % (gx0 + c * gcell + 8, gy0 + r * gcell + 8, gcell - 16, gcell - 16))


def plant(cx, cy, kind):
    if kind == 'sun':
        petals = ''.join('<ellipse cx="%.1f" cy="%.1f" rx="6" ry="10" fill="#ff8aa0" transform="rotate(%d %.1f %.1f)"/>' % (cx, cy - 9, a, cx, cy) for a in range(0, 360, 60))
        return '<circle cx="%d" cy="%d" r="20" fill="#3f8f4f"/>%s<circle cx="%d" cy="%d" r="5" fill="#ffd36a"/>' % (cx, cy + 4, petals, cx, cy)
    if kind == 'shade':
        return ''.join('<path d="M%d %d q%d -22 %d -26 q-2 14 -%d 26z" fill="%s"/>' % (cx, cy + 12, d, d * 1.3, d, c) for d, c in [(-14, '#2f6f3a'), (14, '#3f8f4f'), (0, '#5fae6a')])
    return '<circle cx="%d" cy="%d" r="18" fill="#3f7f3a"/><circle cx="%d" cy="%d" r="11" fill="#5fae6a"/>' % (cx, cy, cx - 4, cy - 4)


for c, r, k in [(4, 1, 'shade'), (5, 2, 'shade'), (0, 4, 'sun'), (3, 4, 'sun'), (4, 3, 'bush')]:
    garden.append(plant(gx0 + c * gcell + gcell // 2, gy0 + r * gcell + gcell // 2, k))
garden.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#ff5a3c" opacity=".3" stroke="#ff5a3c" stroke-width="2"/>' % (gx0 + 1 * gcell, gy0 + 4 * gcell, gcell, gcell))
garden.append(plant(gx0 + 1 * gcell + gcell // 2, gy0 + 4 * gcell + gcell // 2 - 4, 'shade'))
garden.append('<g transform="translate(%d %d)"><circle r="11" fill="#ff5a3c" stroke="#fff" stroke-width="2"/><text y="5" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="Cairo">!</text></g>' % (gx0 + 2 * gcell - 6, gy0 + 4 * gcell + 6))
garden_scr = ('<div class="pz-bg garden"></div><svg class="bg" viewBox="0 0 390 844">%s<rect x="%d" y="%d" width="%d" height="%d" rx="14" fill="#6b4a2a"/>%s</svg>'
              % (DEFS, gx0 - 8, gy0 - 8, G * gcell + 16, G * gcell + 16, ''.join(garden))
              + '<div class="hud"><button class="rbtn">%s</button><div class="ttl"><small>الحديقة · التخطيط</small><b>ازرع بالقواعد</b></div><div class="goal"><small>القواعد</small><b class="ltr">2 / 3</b></div></div>' % ICON['pause']
              + '<div class="rules"><i class="ok">☀️ نباتات الشمس في الشمس ✓</i><i class="bad">🌿 نبات ظل في الشمس ✗</i><i class="ok">💧 كل نبتة يصلها الماء ✓</i></div>'
              + '<div class="bot" style="left:16px;top:500px">%s</div>' % can_svg()
              + '<div class="tray"><div class="seeds"><div class="sd"><svg width="54" height="48" viewBox="0 0 54 48">%s</svg><b>زهرة شمس</b><span class="cnt">×2</span></div><div class="sd sel"><svg width="54" height="48" viewBox="0 0 54 48">%s</svg><b>سرخس ظل</b><span class="cnt">×1</span></div><div class="sd"><svg width="54" height="48" viewBox="0 0 54 48">%s</svg><b>شجيرة</b><span class="cnt">×1</span></div><div class="sd"><svg width="54" height="48" viewBox="0 0 54 48"><rect x="10" y="10" width="34" height="28" rx="10" fill="#d9c49a" stroke="#b8a070"/></svg><b>حجر ممر</b><span class="cnt">×3</span></div></div><div class="actrow"><button class="sq">%s</button><button class="sq">%s</button><button class="big push">ازرع 🌱</button></div></div>'
              % (plant(27, 26, 'sun'), plant(27, 30, 'shade'), plant(27, 24, 'bush'), ICON['undo'], ICON['bulb']))

# =============== 7. WIN ===============
win = ('<svg class="bg" viewBox="0 0 390 844"><svg x="0" y="60" width="390" height="640" viewBox="-40 120 470 600" preserveAspectRatio="xMidYMid slice">%s%s</svg></svg>' % (DEFS, room('after'))
       + '<div class="dim"></div><div class="panel"><div class="stars">%s<span class="mid">%s</span>%s</div><div class="ribbon">رائع!</div>'
         '<h3>السجادة عادت كالجديدة</h3><div class="ba"><div class="bai b"><span>قبل</span></div><div class="bai a"><span>بعد</span></div></div>'
         '<div class="chips"><div class="chip">🧪 منظّف واحد متبقٍ</div><div class="chip">✨ بلا سيلان ألوان</div></div>'
         '<div class="rew"><div class="rw">%s<b>+60</b></div><div class="rw">%s<b>+3</b></div></div>'
         '<button class="big purple">%s ضاعف العملات <span class="tag">إعلان اختياري</span></button><button class="big">متابعة</button></div>'
       % (star(84), star(108), star(84), coin(26), star(24), ICON['film']))

# =============== 8. AREAS ===============
AREAS = [('المدخل', '🚪', 'الأساسيات', 100, 'done'), ('الصالة', '🛋️', 'السجاد · الكهرباء', 62, 'cur'), ('المطبخ', '🍳', 'السباكة · البلاط', 0, 'lock'),
         ('المكتبة', '📚', 'الكتب · أول سر', 0, 'lock'), ('الورشة', '🪚', 'النجارة · التروس', 0, 'lock'), ('الحديقة', '🌿', 'التخطيط · القصّ', 0, 'lock'),
         ('الفناء الخلفي', '🏊', 'المسبح', 0, 'soon'), ('الجراج', '🚗', 'السيارة القديمة', 0, 'soon')]
cards = ''.join('<div class="area %s"><div class="ai">%s</div><div class="at"><b>%s</b><small>%s · 20 مهمة</small>%s</div>%s</div>' % (
    st, emo, n, sub,
    '<div class="mini"><i style="width:%d%%"></i></div>' % p if st in ('done', 'cur') else ('<span class="lk">%s أكمل المنطقة السابقة</span>' % ICON['lock'] if st == 'lock' else '<span class="lk soon">تحديث قادم</span>'),
    '<span class="ok">✓</span>' if st == 'done' else ('<button class="go">%s</button>' % ICON['play'] if st == 'cur' else '')) for n, emo, sub, p, st in AREAS)
areas = ('<div class="pz-bg map"></div>' + '<div class="phead"><button class="rbtn">%s</button><h2>مناطق البيت</h2><div class="res">%s<b>38</b></div></div>' % (ICON['back'], star(18))
         + '<div class="secret"><span>🔐</span><div><b>أسرار البيت</b><small>قطعة 1 من 6 من المخطط الأصلي</small></div><div class="pieces6"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div></div>'
         + '<div class="alist">%s</div>' % cards + nav('المناطق'))

# =============== 9. SHOP ===============
def mini_bot(skin, ring='#3fe0d0'):
    return '<svg width="96" height="80" viewBox="20 40 180 150">%s</svg>' % robot(110, 120, 1.0, skin, ring)


shop = ('<div class="pz-bg map"></div>' + '<div class="phead"><button class="rbtn">%s</button><h2>المتجر</h2><div class="res">%s<b>2,450</b></div></div>' % (ICON['back'], coin())
        + '<div class="shop"><div class="starter"><div class="stl"><span class="stag">مرة واحدة فقط</span><b>حزمة البداية</b><small>1,000 عملة · 5 تلميحات · شكل نحاسي</small></div><button class="price big2">$0.99</button></div>'
        + '<h4>أشكال الأدوات</h4><div class="skins"><div class="sk">%s<b>الكلاسيكية</b><span class="own">مُستخدمة ✓</span></div><div class="sk">%s<b>النحاسية</b><button class="price">$0.99</button></div><div class="sk opt"><span class="opttag">اختياري</span>%s<b>الروبوت المساعد</b><button class="price tog">تفعيل</button></div></div>' % (toolbox_svg('classic', 84), toolbox_svg('brass', 84), mini_bot('classic'))
        + '<h4>طُرز الديكور</h4><div class="decos"><div class="dc" style="--c:#2f8f8a"><i></i><b>ساحلي</b><span class="own">مجاني</span></div><div class="dc" style="--c:#a8693a"><i></i><b>كلاسيكي</b><button class="price">$1.49</button></div><div class="dc" style="--c:#4a4f57"><i></i><b>عصري</b><button class="price">$1.49</button></div></div>'
        + '<h4>العملات</h4><div class="coins">%s</div>' % ''.join('<div class="cpk">%s<b>%s</b>%s<button class="price">%s</button></div>' % (coin(28 + i * 4), a, ('<span class="bonus">%s</span>' % bo) if bo else '', pr) for i, (a, bo, pr) in enumerate([('500', '', '$0.49'), ('1,200', '', '$0.99'), ('3,500', '+15%', '$2.99'), ('10,000', '+40%', '$5.99')]))
        + '<div class="row2"><div class="noads"><b>إزالة الإعلانات</b><small>للأبد · تبقى المكافآت الاختيارية</small><button class="price">$2.99</button></div><div class="free"><b>50 عملة مجاناً</b><small>شاهد إعلاناً قصيراً</small><button class="price pur">%s مشاهدة</button></div></div>' % ICON['film']
        + '<div class="trust">✓ لا صناديق حظ · ترى بالضبط ما تشتريه</div></div>')

SCREENS = [('الرئيسية: البيت على الجرف', home), ('الغرفة قبل الترميم', before), ('الغرفة بعد الترميم', after),
           ('لغز: غسيل السجاد', rug_scr), ('لغز: تخطيط قصّ الخشب', wood_scr), ('لغز: تخطيط الحديقة', garden_scr),
           ('شاشة الفوز', win), ('مناطق البيت', areas), ('المتجر', shop)]

CSS = open('/home/user/oya-agent-agent/design/house-game/style.css').read()
html = '<!doctype html><html lang="ar"><head><meta charset="utf-8"><style>%s</style></head><body><svg width="0" height="0" style="position:absolute">%s</svg>%s</body></html>' % (
    CSS, DEFS, ''.join('<div class="ph" id="s%d"><div class="cap">%s</div><div class="scr">%s</div></div>' % (i + 1, t, b) for i, (t, b) in enumerate(SCREENS)))
open(OUT, 'w').write(html)
print('ok', len(SCREENS))
