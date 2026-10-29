# English redesign of the abandoned-house game: isometric diorama rooms, light frosted UI, Fraunces + Nunito.
import math

_src = open('/home/user/oya-agent-agent/design/house-game/generate.py').read()
OLD = {}
exec(_src[:_src.index('SCREENS = [')], OLD)          # reuse puzzle art: rug_top, board, plant, garden, tools, coin, star
OUT = '/home/user/oya-agent-agent/design/house-game-en/house-mockups-en.html'
mix, P, coin, star, tool, toolbox_svg, saw_svg, can_svg = (OLD[k] for k in ('mix', 'P', 'coin', 'star', 'tool', 'toolbox_svg', 'saw_svg', 'can_svg'))


def poly(pts, fill, stroke='none', sw=0, extra=''):
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>' % (P(pts), fill, stroke, sw, extra)


# ---------- isometric engine ----------
class Iso:
    def __init__(self, ox, oy, s):
        self.ox, self.oy, self.s = ox, oy, s

    def __call__(self, x, y, z=0):
        return self.ox + (x - y) * .866 * self.s, self.oy + (x + y) * .5 * self.s - z * self.s

    def box(self, x, y, z, w, d, h, col, line=None, top=None):
        p = self
        T = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)]
        R = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)]
        L = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)]
        ln = line or mix(col, '#000000', .35)
        return (poly(L, mix(col, '#000000', .12), ln, .8) + poly(R, mix(col, '#000000', .26), ln, .8)
                + poly(T, top or mix(col, '#ffffff', .18), ln, .8))

    def floor_quad(self, x, y, w, d, col, z=0, extra=''):
        p = self
        return poly([p(x, y, z), p(x + w, y, z), p(x + w, y + d, z), p(x, y + d, z)], col, extra=extra)

    def shadow(self, x, y, w, d, op=.25):
        p = self
        return '<polygon points="%s" fill="#3a2a1a" opacity="%s" filter="url(#blur6)"/>' % (P([p(x - .2, y - .2), p(x + w + .5, y - .2), p(x + w + .5, y + d + .5), p(x - .2, y + d + .5)]), op)


D = 10.0          # room footprint
HW = 6.2          # wall height


def room_iso(state):
    p = Iso(195, 268, 25)
    B = state == 'before'
    o = []
    # floating diorama slab
    o.append(poly([p(0, 0, 0), p(D, 0, 0), p(D, 0, -.8), p(D, D, -.8), p(0, D, -.8), p(0, D, 0)], '#000', extra='opacity=".18" filter="url(#blur6)" transform="translate(0 14)"'))
    o.append(poly([p(0, D, 0), p(D, D, 0), p(D, D, -.8), p(0, D, -.8)], '#8a6646' if not B else '#5e4c3c'))
    o.append(poly([p(D, 0, 0), p(D, D, 0), p(D, D, -.8), p(D, 0, -.8)], '#6e4f35' if not B else '#4a3c30'))
    # floor planks
    fl = '#d8a46c' if not B else '#8c7258'
    o.append(p.floor_quad(0, 0, D, D, fl))
    for i in range(1, 12):
        y = i * D / 12
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1" opacity=".55"/>' % (*p(0, y), *p(D, y), '#9a6a3c' if not B else '#5e4c3c'))
    for i in range(12):
        for k in range(3):
            x = (k * 3.7 + i * 1.3) % D
            o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1" opacity=".5"/>' % (*p(x, i * D / 12), *p(x, (i + 1) * D / 12), '#9a6a3c' if not B else '#5e4c3c'))
    # walls (back-left x=0, back-right y=0) with thickness caps
    wl = '#a9cbb7' if not B else '#7f8c84'
    wr = '#bcd8c6' if not B else '#8e9a92'
    o.append(poly([p(0, 0, 0), p(0, D, 0), p(0, D, HW), p(0, 0, HW)], wl))
    o.append(poly([p(0, 0, 0), p(D, 0, 0), p(D, 0, HW), p(0, 0, HW)], wr))
    pat = 'isoPaperNew' if not B else 'isoPaperOld'
    o.append('<polygon points="%s" fill="url(#%s)"/>' % (P([p(0, 0, 0), p(0, D, 0), p(0, D, HW), p(0, 0, HW)]), pat))
    o.append('<polygon points="%s" fill="url(#%s)"/>' % (P([p(0, 0, 0), p(D, 0, 0), p(D, 0, HW), p(0, 0, HW)]), pat))
    cap = '#fffaf0' if not B else '#b8b0a2'
    o.append(poly([p(0, 0, HW), p(D, 0, HW), p(D, -.35, HW), p(-.35, -.35, HW), p(-.35, D, HW), p(0, D, HW)], cap, mix(cap, '#000000', .3), .8))
    o.append(poly([p(-.35, D, HW), p(0, D, HW), p(0, D, -.8), p(-.35, D, -.8)], mix(cap, '#000000', .15)))
    o.append(poly([p(D, -.35, HW), p(D, 0, HW), p(D, 0, -.8), p(D, -.35, -.8)], mix(cap, '#000000', .25)))
    # skirting
    o.append(poly([p(0, 0, 0), p(D, 0, 0), p(D, 0, .25), p(0, 0, .25)], '#fffaf0' if not B else '#6e6152'))
    o.append(poly([p(0, 0, 0), p(0, D, 0), p(0, D, .25), p(0, 0, .25)], '#f2eadc' if not B else '#625748'))
    # window on right wall (y=0)
    wx0, wx1, wz0, wz1 = 5.6, 8.6, 2.0, 5.0
    sky = 'url(#isoSky)'
    o.append(poly([p(wx0, 0, wz0), p(wx1, 0, wz0), p(wx1, 0, wz1), p(wx0, 0, wz1)], sky))
    if B:
        o.append(poly([p(wx0, 0, wz0), p(wx1, 0, wz0), p(wx1, 0, wz1), p(wx0, 0, wz1)], '#4d5a60', extra='opacity=".55"'))
    fc = '#fffaf0' if not B else '#5a4a38'
    o.append('<polygon points="%s" fill="none" stroke="%s" stroke-width="5"/>' % (P([p(wx0, 0, wz0), p(wx1, 0, wz0), p(wx1, 0, wz1), p(wx0, 0, wz1)]), fc))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="4"/>' % (*p((wx0 + wx1) / 2, 0, wz0), *p((wx0 + wx1) / 2, 0, wz1), fc))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="4"/>' % (*p(wx0, 0, (wz0 + wz1) / 2), *p(wx1, 0, (wz0 + wz1) / 2), fc))
    if B:
        for z, dz in [(2.5, .3), (3.5, -.25), (4.4, .2)]:
            o.append(poly([p(wx0 - .3, 0, z), p(wx1 + .3, 0, z + dz), p(wx1 + .3, 0, z + dz + .42), p(wx0 - .3, 0, z + .42)], '#8a6a46', '#4a3520', .8))
    else:
        for x0 in (wx0 - .5, wx1 + .1):
            o.append(poly([p(x0, 0, wz1 + .3), p(x0 + .5, 0, wz1 + .3), p(x0 + .55, 0, wz0 - .6), p(x0 - .05, 0, wz0 - .6)], '#f2b8a0'))
    # fireplace against right wall
    o.append(p.box(1.2, 0, 0, 3.0, .9, 3.0, '#d9cdb9' if not B else '#6d675e'))
    o.append(p.box(1.0, 0, 3.0, 3.4, 1.1, .25, '#8a5a32' if not B else '#4a3f33'))
    o.append(poly([p(2.0, .9, 0), p(3.4, .9, 0), p(3.4, .9, 1.8), p(2.0, .9, 1.8)], '#1d1a17'))
    if not B:
        fx, fy = p(2.7, .9, .5)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="30" ry="22" fill="url(#isoFire)"/><path d="M%.1f %.1f q-7 -12 2 -22 q2 10 7 5 q4 -9 -2 -17 q14 10 10 26 q5 -3 5 -10 q7 12 -4 18z" fill="#ffb02e"/>' % (fx, fy - 4, fx - 8, fy + 6))
    # clock on right wall
    cx, cy = p(4.8, 0, 4.6)
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="13" ry="15" fill="%s" stroke="%s" stroke-width="3"/>' % (cx, cy, '#fffaf0' if not B else '#c9c1b2', '#b07a3a' if not B else '#4a3f33'))
    # bookshelf against left wall (x=0)
    o.append(p.box(0, 2.0, 0, .9, 3.2, 4.6, '#8a5a32' if not B else '#4a3424'))
    import random
    r = random.Random(3)
    for z in (.4, 1.5, 2.6, 3.6):
        y = 2.15
        while y < 5.0:
            dy = .22 + r.random() * .12
            if B and r.random() < .4:
                y += dy
                continue
            col = r.choice(['#c44d3a', '#2f7fa8', '#e2b04a', '#3e8a5a', '#8a5ab0']) if not B else r.choice(['#6a5b4c', '#5b5a52', '#71634f'])
            o.append(poly([p(.9, y, z), p(.9, y + dy, z), p(.9, y + dy, z + .8), p(.9, y, z + .8)], col, '#1a120c', .5))
            y += dy + .03
    # painting on left wall
    o.append(poly([p(0, 6.4, 3.0), p(0, 8.6, 3.0), p(0, 8.6, 4.8), p(0, 6.4, 4.8)], '#c9a463' if not B else '#3b2a1d'))
    o.append(poly([p(0, 6.6, 3.2), p(0, 8.4, 3.2), p(0, 8.4, 4.6), p(0, 6.6, 4.6)], '#9fd3ea' if not B else '#5e5a52'))
    if not B:
        o.append(poly([p(0, 6.6, 3.2), p(0, 8.4, 3.2), p(0, 8.4, 3.8), p(0, 6.6, 3.6)], '#2f86ad'))
    # rug
    if B:
        o.append(p.floor_quad(2.6, 3.6, 5.6, 4.6, '#6a4a3a'))
        o.append(p.floor_quad(3.0, 4.0, 4.8, 3.8, '#7c6b56'))
        o.append('<polygon points="%s" fill="#5a4026" filter="url(#dirt)"/>' % P([p(2.6, 3.6), p(8.2, 3.6), p(8.2, 8.2), p(2.6, 8.2)]))
    else:
        o.append(p.floor_quad(2.6, 3.6, 5.6, 4.6, '#b8433a'))
        o.append(p.floor_quad(3.0, 4.0, 4.8, 3.8, '#f1e3c4'))
        cxr, cyr = 5.4, 5.9
        for s, c in [(1.9, '#2f7f8a'), (1.3, '#e2a33a'), (.7, '#b8433a')]:
            o.append(poly([p(cxr - s, cyr), p(cxr, cyr - s), p(cxr + s, cyr), p(cxr, cyr + s)], c))
    # furniture
    items = []
    if B:
        items.append((6.5, p.box(5.6, 6.6, 0, 1.0, 1.0, .9, '#a88a64') + p.box(5.7, 6.7, .9, .8, .8, .7, '#9a7c58')))
        items.append((9.0, p.box(7.6, 8.4, 0, 1.4, 1.0, .5, '#6d6458')))
        # sheet-covered sofa
        sofa = p.box(3.2, 3.2, 0, 4.4, 1.6, 1.4, '#b8b2a4') + p.box(3.2, 3.2, 1.4, 4.4, .5, 1.0, '#c4beb0')
        items.append((5.0, sofa))
        items.append((7.0, p.box(4.6, 6.4, 0, 1.6, 1.0, .9, '#5a4030')))
        items.append((9.4, p.box(8.2, 5.4, 0, 1.4, 1.6, 1.2, '#6e6458')))
        pud = p(7.5, 2.4)
        items.append((0, '<ellipse cx="%.1f" cy="%.1f" rx="30" ry="12" fill="#6f8c99" opacity=".6"/>' % pud))
    else:
        sofa = (p.box(3.2, 3.2, 0, 4.4, 1.6, .9, '#2f8f8a') + p.box(3.2, 3.2, .9, 4.4, .5, 1.3, '#2a8580')
                + p.box(3.0, 3.2, 0, .3, 1.6, 1.3, '#277a75') + p.box(7.6, 3.2, 0, .3, 1.6, 1.3, '#277a75')
                + p.box(3.6, 3.75, .9, 1.4, .4, .7, '#f2c46a') + p.box(5.8, 3.75, .9, 1.4, .4, .7, '#e98a6a'))
        items.append((5.0, sofa))
        items.append((7.0, p.box(4.6, 6.4, 0, 1.6, 1.0, .8, '#a8693a') + p.box(5.2, 6.7, .8, .4, .4, .5, '#f7f3ea')))
        tp = p(5.4, 6.9, 1.4)
        items.append((7.1, '<circle cx="%.1f" cy="%.1f" r="8" fill="#5fae6a"/><circle cx="%.1f" cy="%.1f" r="5" fill="#7cc785"/>' % (tp[0], tp[1], tp[0] + 5, tp[1] - 4)))
        items.append((9.4, p.box(8.2, 5.4, 0, 1.4, 1.6, .8, '#e2a33a') + p.box(9.3, 5.4, .8, .3, 1.6, 1.1, '#d0932e')))
        for (x, y) in [(8.8, 8.6), (1.2, 8.6)]:
            items.append((x + y, p.box(x, y, 0, .7, .7, .8, '#c96f4a') + ''.join(
                '<path d="M%.1f %.1f q%.1f -18 %.1f -30 q-2 16 -%.1f 30z" fill="%s"/>' % (*p(x + .35, y + .35, .8), dx, dx * 1.2, dx, c)
                for dx, c in [(-12, '#2f6f3a'), (12, '#3f8f4f'), (0, '#5fae6a'), (-6, '#4f9f5a')])))
        lb = p(1.4, 1.6)
        items.append((2.8, '<ellipse cx="%.1f" cy="%.1f" rx="70" ry="50" fill="url(#isoWarm)"/><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#2b2620" stroke-width="3"/><path d="M%.1f %.1f h28 l-7 -22 h-14z" fill="#fff1c9" stroke="#d9b770"/>' % (lb[0], lb[1] - 70, lb[0], lb[1], lb[0], lb[1] - 95, lb[0] - 14, lb[1] - 92)))
    for _, s in sorted(items, key=lambda t: t[0]):
        o.append(s)
    if B:
        o.append('<polygon points="%s" fill="#3a3a44" opacity=".18"/>' % P([p(-.4, -.4, HW), p(D, -.4, HW), p(D, 0, -.8), p(D, D, -.8), p(0, D, -.8), p(-.4, D, HW)]))
        for x, y in [(80, 240), (300, 210)]:
            o.append(''.join('<line x1="%d" y1="%d" x2="%.1f" y2="%.1f" stroke="#e8e4da" stroke-width=".8" opacity=".6"/>' % (x, y, x + math.cos(math.radians(a)) * 34, y + math.sin(math.radians(a)) * 34) for a in range(20, 170, 30)))
    return ''.join(o)


def house_iso():
    p = Iso(178, 418, 13.5)
    o = []
    # island block
    o.append(poly([p(-2, -2, 0), p(16, -2, 0), p(16, -2, -5), p(16, 16, -5), p(-2, 16, -5), p(-2, 16, 0)], '#000', extra='opacity=".25" filter="url(#blur6)" transform="translate(0 20)"'))
    o.append(poly([p(-2, 16, 0), p(16, 16, 0), p(16, 16, -5), p(-2, 16, -5)], '#b98a5e'))
    o.append(poly([p(16, -2, 0), p(16, 16, 0), p(16, 16, -5), p(16, -2, -5)], '#9a6f48'))
    for k in range(6):
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#7a5636" stroke-width="2" opacity=".5"/>' % (*p(-2 + k * 3.4, 16, -.6 - (k % 3)), *p(-2 + k * 3.4 + 2, 16, -.6 - (k % 3))))
    o.append(p.floor_quad(-2, -2, 18, 18, '#8fc06a'))
    o.append(poly([p(-2, 16, 0), p(16, 16, 0), p(16, 16, -.6), p(-2, 16, -.6)], '#6e9f4c'))
    o.append(poly([p(16, -2, 0), p(16, 16, 0), p(16, 16, -.6), p(16, -2, -.6)], '#5e8c40'))
    o.append(p.floor_quad(6.2, 9.5, 1.6, 6.5, '#e3cfa4'))
    # house body
    o.append(p.box(1, 1, 0, 10, 8.5, 6, '#efe3cc'))
    o.append(p.box(1, 1, 0, 4.5, 8.5, 6, '#b8a888'))          # weathered half
    # gable roof along x
    rz, ridge = 6, 9.6
    o.append(poly([p(.5, 9.9, rz), p(11.5, 9.9, rz), p(11.5, 5.25, ridge), p(.5, 5.25, ridge)], '#a94f3c'))
    o.append(poly([p(.5, 9.9, rz), p(5.5, 9.9, rz), p(5.5, 5.25, ridge), p(.5, 5.25, ridge)], '#6a5e56'))
    o.append(poly([p(11.5, .6, rz), p(11.5, 9.9, rz), p(11.5, 5.25, ridge)], '#d9c8ac'))
    o.append(p.box(7.5, 3.5, 7.8, 1.2, 1.2, 3.2, '#8a7a6a'))
    # windows on front (y = 9.5) and right (x = 11)
    for x0, ok in [(1.8, False), (3.6, False), (7.6, True), (9.3, True)]:
        for z0 in (.9, 3.4):
            q = [p(x0, 9.5, z0), p(x0 + 1.2, 9.5, z0), p(x0 + 1.2, 9.5, z0 + 1.6), p(x0, 9.5, z0 + 1.6)]
            o.append(poly(q, '#ffe08a' if ok else '#3d4a52', '#fffaf0' if ok else '#5a4a38', 2))
            if not ok:
                o.append(poly([p(x0 - .2, 9.5, z0 + .5), p(x0 + 1.4, 9.5, z0 + .8), p(x0 + 1.4, 9.5, z0 + 1.1), p(x0 - .2, 9.5, z0 + .8)], '#8a6a46'))
    for y0, ok in [(2.2, True), (5.5, False)]:
        q = [p(11, y0, 3.2), p(11, y0 + 1.4, 3.2), p(11, y0 + 1.4, 4.8), p(11, y0, 4.8)]
        o.append(poly(q, '#ffe08a' if ok else '#3d4a52', '#fffaf0' if ok else '#5a4a38', 2))
    o.append(poly([p(6.3, 9.5, 0), p(7.6, 9.5, 0), p(7.6, 9.5, 2.4), p(6.3, 9.5, 2.4)], '#2f7f8a', '#1f5f68', 1.5))
    # gardens: wild vs neat
    for x, y, r in [(1.0, 12.5, 16), (2.6, 13.6, 13), (0.2, 14.4, 12), (3.8, 12.2, 10)]:
        cx, cy = p(x, y, 1)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="%d" ry="%d" fill="#4f7a38"/>' % (cx, cy, r, r * .8))
    for x, c in [(9.0, '#ff8aa0'), (10.4, '#ffd36a'), (11.8, '#ff8aa0'), (13.2, '#ffffff')]:
        cx, cy = p(x, 12.5, .5)
        o.append('<circle cx="%.1f" cy="%.1f" r="7" fill="#3f8f4f"/><circle cx="%.1f" cy="%.1f" r="3" fill="%s"/>' % (cx, cy, cx + 2, cy - 3, c))
    # lighthouse on the far corner
    lx, ly = p(14.2, 1.2, 0)
    o.append('<path d="M%.1f %.1f l6 -120 h16 l6 120z" fill="#f2ede4"/><path d="M%.1f %.1f h22 l-1 -18 h-20z M%.1f %.1f h20 l-1 -18 h-18z" fill="#c9473b"/>' % (lx - 14, ly, lx - 11, ly - 34, lx - 9, ly - 78))
    o.append('<rect x="%.1f" y="%.1f" width="24" height="16" rx="3" fill="#3b4652"/><path d="M%.1f %.1f l16 -14 l16 14z" fill="#2b3640"/>' % (lx - 12, ly - 136, lx - 16, ly - 136))
    return ''.join(o)


DEFS = OLD['DEFS'].replace('</defs>', '''
<filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
<pattern id="isoPaperNew" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.6" fill="#ffffff" opacity=".45"/></pattern>
<pattern id="isoPaperOld" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.6" fill="#3d3a33" opacity=".25"/></pattern>
<linearGradient id="isoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f2"/><stop offset=".6" stop-color="#d7eef8"/><stop offset=".61" stop-color="#3a96bf"/><stop offset="1" stop-color="#22709a"/></linearGradient>
<radialGradient id="isoFire" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#ffdd7a"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="isoWarm" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient>
<linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe9f2"/><stop offset=".55" stop-color="#f6efe2"/><stop offset="1" stop-color="#f2e3cc"/></linearGradient>
</defs>''')

I = {
    'home': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
    'map': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    'book': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-1 .2V20a2 2 0 0 1 2-2h5z"/></svg>',
    'bag': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    'gear': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    'back': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>',
    'pause': '<svg width="20" height="20" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1.5" fill="currentColor"/></svg>',
    'undo': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    'bulb': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    'rotate': '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
    'play': '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>',
    'camera': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    'film': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
    'lock': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    'check': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>',
    'key': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/></svg>',
}


def tabs(on):
    t = [('bag', 'Shop'), ('book', 'Journal'), ('home', 'House'), ('map', 'Areas')]
    return '<nav class="tabs">%s</nav>' % ''.join('<button class="%s">%s<span>%s</span></button>' % ('on' if n == on else '', I[k], n) for k, n in t)


def hud(coins='2,450', stars='38', left=None):
    l = '<button class="ic">%s</button>' % I[left] if left else ''
    return '<div class="hud">%s<div class="chip">%s<b>%s</b></div><div class="chip">%s<b>%s</b></div><button class="ic ml">%s</button></div>' % (l, coin(20), coins, star(18), stars, I['gear'])


def scene(svg, h=844, vb='0 0 390 844'):
    return '<svg class="bg" viewBox="%s" width="390" height="%d">%s%s</svg>' % (vb, h, DEFS, svg)


def marker(x, y, n, emo, on=False):
    return '<div class="mk%s" style="left:%dpx;top:%dpx"><span>%s</span><i>%d</i></div>' % (' on' if on else '', x - 20, y - 20, emo, n)


# =============== 1 HOME ===============
home = (scene('<rect width="390" height="844" fill="url(#bgSky)"/><rect y="500" width="390" height="344" fill="#9ccfe0"/>'
              + ''.join('<path d="M%d %d q8 -4 16 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>' % (x, y) for x, y in [(30, 600), (300, 590), (60, 680), (330, 700), (200, 760)])
              + house_iso())
        + hud()
        + '<div class="brand"><small>WORKING TITLE</small><h1>The Abandoned<br>House</h1><p>Restore · Discover · Light up</p></div>'
        + '<div class="card prog"><div class="row"><b>House restored</b><span>34%</span></div><div class="bar"><i style="width:34%"></i></div><div class="row sub"><span>Next: Living Room · Task 4</span><span>2 secrets found</span></div></div>'
        + '<button class="cta">%s Continue</button>' % I['play'] + tabs('House'))

# =============== 2 ROOM BEFORE ===============
p0 = Iso(195, 268, 25)
mk_b = [(p0(5.4, 5.9), 1, '🧽', True), (p0(7.1, 0, 3.5), 2, '🔨', False), (p0(5.4, 4.0, 3.0), 3, '🪡', False), (p0(2.7, .5, 2.6), 4, '🔧', False), (p0(0, 8, 5.4), 5, '🖌️', False)]
before = (scene('<rect width="390" height="844" fill="#e9e4da"/><g transform="translate(0 60)">%s</g>' % room_iso('before'))
          + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>AREA 2</small><b>Living Room</b></div><span class="tag gray">Before</span></div>' % I['back']
          + ''.join(marker(x, y + 60, n, e, on) for (x, y), n, e, on in mk_b)
          + '<div class="sheet"><div class="grab"></div><div class="sh-h"><div class="tb">%s</div><div><small>FROM THE HOUSE JOURNAL</small><p>“The rug was the first thing I bought for this house. Mud won’t hide its colours for long.”</p></div></div>'
            '<div class="tasks"><div class="tk on"><span>🧽</span><b>Wash the rug</b><em>★ 1</em></div><div class="tk"><span>🔨</span><b>Open the window</b><em>★ 1</em></div><div class="tk"><span>🪡</span><b>Restore the sofa</b><em>★ 2</em></div><div class="tk lock"><span>🔧</span><b>Fix fireplace</b><em>%s</em></div></div>'
            '<button class="cta in">Start: Wash the rug</button></div>' % (toolbox_svg('classic', 54), I['lock']))

# =============== 3 ROOM AFTER ===============
after = (scene('<rect width="390" height="844" fill="#f4ecdd"/><g transform="translate(0 60)">%s</g>' % room_iso('after'))
         + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>AREA 2</small><b>Living Room</b></div><span class="tag gold">After ✨</span></div>' % I['back']
         + '<div class="sheet"><div class="grab"></div><div class="done-h"><h3>Living Room restored</h3><p>%s A hidden key appeared in the Library</p></div>'
           '<div class="seg"><span>Style</span><i class="on" style="--c:#2f8f8a">Coastal</i><i style="--c:#a8693a">Classic</i><i style="--c:#4a4f57">Modern</i></div>'
           '<div class="two"><button class="ghost">%s Before / After</button><button class="cta in">Next area</button></div></div>' % (I['key'], I['camera']))

# =============== 4 RUG ===============
rug_svg = OLD['rug_top'](52, 196, 286, 340, .42).replace('>قهوة<', '>Coffee<').replace('>حبر<', '>Ink<').replace('>صدأ<', '>Rust<')
rug_svg = rug_svg.replace('font-family="Cairo"', 'font-family="Nunito"')


def bottle(col, label, cnt, sel=False):
    return ('<div class="btl%s"><svg width="40" height="56" viewBox="0 0 46 62"><rect x="17" y="2" width="12" height="10" rx="2" fill="#33414f"/><rect x="8" y="12" width="30" height="46" rx="9" fill="%s"/><rect x="12" y="26" width="22" height="16" rx="4" fill="#fff" opacity=".9"/><rect x="11" y="15" width="6" height="30" rx="3" fill="#fff" opacity=".35"/></svg><b>%s</b><span class="cnt">%d</span></div>'
            % (' sel' if sel else '', col, label, cnt))


rug_scr = (scene('<rect width="390" height="844" fill="#e9e4da"/><rect x="24" y="168" width="342" height="396" rx="22" fill="#c08752"/><rect x="24" y="168" width="342" height="396" rx="22" fill="url(#planks)"/>' + rug_svg
                 + ''.join('<circle cx="%d" cy="%d" r="%d" fill="#e9f8ff" stroke="#a7d8ef" stroke-width="1.2"/>' % (x, y, r) for x, y, r in [(236, 318, 7), (262, 336, 5), (248, 346, 4), (272, 316, 4)]))
           + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>LIVING ROOM · RUG</small><b>Stain Chemistry</b></div><div class="ring" style="--p:58"><b>58%%</b></div></div>' % I['pause']
           + '<div class="steps"><i class="ok">%s Dust</i><i class="on">Stains</i><i>Wash</i><i>Rinse</i><i>Dry</i></div>' % I['check']
           + '<div class="tcur2" style="left:262px;top:268px"><svg width="76" height="76" viewBox="-30 -30 60 60">%s</svg><span>Ink remover</span></div>' % tool('spray', 0, 0, 1.6)
           + '<div class="hint2">%s Ink won’t lift with water alone — try another cleaner.</div>' % I['bulb']
           + '<div class="dock"><div class="row5">%s%s%s%s%s</div><div class="tools"><button class="ic">%s</button><button class="ic">%s</button><div class="st">%s%s%s</div></div></div>'
           % (bottle('#4dc3ff', 'Warm water', 9), bottle('#ffb84d', 'Mild soap', 3), bottle('#8c5cff', 'Ink remover', 2, True), bottle('#5fe08a', 'Baking soda', 2), bottle('#ff7a59', 'Rust remover', 1),
              I['undo'], I['bulb'], star(22), star(22), star(22, False)))

# =============== 5 WOOD ===============
cell = 38
board = OLD['board'](24, 214, 9, 5, cell, [([(c, r) for c in range(0, 5) for r in range(0, 2)], '#b8743a', 'Top'), ([(0, 0), (0, 1), (0, 2)], '#8a5a32', 'Leg'), ([(1, 2), (1, 3), (1, 4)], '#8a5a32', 'Leg')],
                    ghost=([(6, 0), (7, 0), (8, 0), (6, 1), (7, 1), (8, 1)], 'Shelf'), waste_cells=[(5, 2)]).replace('font-family="Cairo"', 'font-family="Nunito"')


def piece(shape, col, lab, cell=12):
    xs = [c[0] for c in shape]; ys = [c[1] for c in shape]
    w, h = (max(xs) + 1) * cell, (max(ys) + 1) * cell
    inner = ''.join('<rect x="%d" y="%d" width="%d" height="%d" rx="2" fill="%s" stroke="#5a3416" stroke-width=".8"/>' % (cx * cell, cy * cell, cell - 1, cell - 1, col) for cx, cy in shape)
    return '<div class="pc"><svg width="%d" height="%d" viewBox="-2 -2 %d %d">%s</svg><b>%s</b></div>' % (w + 4, h + 4, w + 4, h + 4, inner, lab)


wood_scr = (scene('<rect width="390" height="844" fill="#efe6d6"/>' + board
                  + '<text x="24" y="202" font-family="Nunito" font-weight="900" font-size="13" fill="#7a5a3a">WALNUT BOARD · 9 × 5</text>')
            + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>WORKSHOP · CARPENTRY</small><b>Plan the Cut</b></div><div class="ring green" style="--p:22"><b>7%%</b></div></div>' % I['pause']
            + '<div class="card goal"><div><small>GOAL</small><b>Coffee table</b><span>Top + 4 legs + shelf</span><span class="warn">Avoid the knot ●</span></div><svg width="130" height="70" viewBox="0 0 160 80"><polygon points="20,30 140,30 160,46 40,46" fill="#c88a52"/><polygon points="40,46 160,46 160,52 40,52" fill="#8a5a32"/><rect x="46" y="52" width="7" height="26" fill="#8a5a32"/><rect x="148" y="52" width="7" height="26" fill="#8a5a32"/><rect x="28" y="36" width="6" height="30" fill="#a8693a"/><rect x="132" y="36" width="6" height="30" fill="#a8693a"/></svg></div>'
            + '<div class="sawpos">%s</div>' % saw_svg()
            + '<div class="dock"><div class="row5">%s%s%s%s</div><div class="tools"><button class="ic">%s</button><button class="ic">%s</button><button class="cta in grow">Cut 🪚</button></div></div>'
            % (piece([(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1)], '#c88a52', 'Shelf ×1'), piece([(0, 0), (0, 1), (0, 2)], '#a8693a', 'Leg ×2'),
               piece([(0, 0), (1, 0), (2, 0), (3, 0)], '#d9a46d', 'Frame ×1'), piece([(0, 0), (1, 0), (1, 1)], '#b8743a', 'Brace ×1'), I['rotate'], I['undo']))

# =============== 6 GARDEN ===============
g = OLD['garden']
gx0, gy0, G, gc = OLD['gx0'], OLD['gy0'], OLD['G'], OLD['gcell']
plant = OLD['plant']
garden_scr = (scene('<rect width="390" height="844" fill="#e6efdc"/><rect x="%d" y="%d" width="%d" height="%d" rx="18" fill="#6b4a2a"/>%s' % (gx0 - 8, gy0 - 8, G * gc + 16, G * gc + 16, ''.join(g)))
              + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>GARDEN · PLANNING</small><b>Plant by the Rules</b></div><div class="ring" style="--p:66"><b>2/3</b></div></div>' % I['pause']
              + '<div class="rules2"><i class="ok">☀️ Sun plants in sunlight</i><i class="bad">🌿 Shade fern in full sun</i><i class="ok">💧 Every plant gets water</i></div>'
              + '<div class="canpos">%s</div>' % can_svg()
              + '<div class="dock"><div class="row5"><div class="sd"><svg width="48" height="44" viewBox="0 0 54 48">%s</svg><b>Sunflower</b><span class="cnt">2</span></div><div class="sd sel"><svg width="48" height="44" viewBox="0 0 54 48">%s</svg><b>Shade fern</b><span class="cnt">1</span></div><div class="sd"><svg width="48" height="44" viewBox="0 0 54 48">%s</svg><b>Shrub</b><span class="cnt">1</span></div><div class="sd"><svg width="48" height="44" viewBox="0 0 54 48"><rect x="10" y="10" width="34" height="28" rx="10" fill="#d9c49a" stroke="#b8a070"/></svg><b>Path stone</b><span class="cnt">3</span></div></div><div class="tools"><button class="ic">%s</button><button class="ic">%s</button><button class="cta in grow">Plant 🌱</button></div></div>'
              % (plant(27, 26, 'sun'), plant(27, 30, 'shade'), plant(27, 24, 'bush'), I['undo'], I['bulb']))

# =============== 7 WIN ===============
win = (scene('<rect width="390" height="844" fill="#f4ecdd"/><g transform="translate(0 60)">%s</g><rect width="390" height="844" fill="#23395b" opacity=".55"/>' % room_iso('after')
             + ''.join('<rect x="%d" y="%d" width="8" height="4" rx="1.5" fill="%s" transform="rotate(%d %d %d)"/>' % (x, y, c, a, x, y) for x, y, c, a in
                       [(40, 140, '#ff8a6b', 20), (90, 110, '#ffd36a', -30), (300, 130, '#7fd6c4', 40), (340, 180, '#ff8a6b', -10), (60, 210, '#a58cff', 60), (250, 95, '#ffd36a', 10), (180, 150, '#7fd6c4', -40), (320, 250, '#ffd36a', 25)]))
       + '<div class="win"><div class="stars3">%s<span>%s</span>%s</div><small>TASK COMPLETE</small><h2>Good as new!</h2><p>The rug is clean — no colour bleed.</p>'
         '<div class="ba2"><div class="b"><span>Before</span></div><div class="a"><span>After</span></div></div>'
         '<div class="rw2"><div>%s<b>+60</b></div><div>%s<b>+3</b></div></div>'
         '<button class="ghost wide">%s Double coins <em>optional ad</em></button><button class="cta in">Continue</button></div>' % (star(56), star(74), star(56), coin(24), star(22), I['film']))

# =============== 8 AREAS ===============
AREAS = [('Entrance', '🚪', 'Basics', 100, 'done'), ('Living Room', '🛋️', 'Rugs · Wiring', 62, 'cur'), ('Kitchen', '🍳', 'Plumbing · Tiles', 0, 'lock'),
         ('Library', '📚', 'Books · First secret', 0, 'lock'), ('Workshop', '🪚', 'Carpentry · Gears', 0, 'lock'), ('Garden', '🌿', 'Planning · Pruning', 0, 'lock'),
         ('Backyard Pool', '🏊', 'Water balance', 0, 'soon'), ('Garage', '🚗', 'The old car', 0, 'soon')]


def ring(pct, st):
    if st == 'done':
        return '<div class="pring done">%s</div>' % I['check']
    if st == 'cur':
        return '<div class="pring" style="--p:%d"><b>%d%%</b></div>' % (pct, pct)
    return '<div class="pring off">%s</div>' % I['lock']


areas = ('<div class="plain"></div>' + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>THE HOUSE</small><b>Areas</b></div><div class="chip">%s<b>38</b></div></div>' % (I['back'], star(18))
         + '<div class="card secret2"><span>🔐</span><div><b>House secrets</b><small>Blueprint piece 1 of 6</small></div><div class="p6"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div></div>'
         + '<div class="alist2">%s</div>' % ''.join('<div class="ar %s"><div class="ae">%s</div><div class="at"><b>%s</b><small>%s · 20 tasks%s</small></div>%s</div>' % (st, e, n, s, ' · Coming soon' if st == 'soon' else '', ring(pc, st)) for n, e, s, pc, st in AREAS)
         + tabs('Areas'))

# =============== 9 SHOP ===============
coins_html = ''.join('<div class="cp">%s<b>%s</b>%s<button class="price">%s</button></div>' % (coin(26 + i * 3), a, ('<em>%s</em>' % bo) if bo else '', pr) for i, (a, bo, pr) in enumerate([('500', '', '$0.49'), ('1,200', '', '$0.99'), ('3,500', '+15%', '$2.99'), ('10,000', '+40%', '$5.99')]))
shop = ('<div class="plain"></div>' + '<div class="topbar"><button class="ic">%s</button><div class="ttl"><small>NO LOOT BOXES</small><b>Shop</b></div><div class="chip">%s<b>2,450</b></div></div>' % (I['back'], coin(20))
        + '<div class="shop2"><div class="starter2"><div><em>ONE-TIME OFFER</em><b>Starter Pack</b><small>1,000 coins · 5 hints · Copper tools</small></div><button class="price light">$0.99</button></div>'
        + '<h4>Tool sets</h4><div class="g3"><div class="it">%s<b>Classic</b><span class="own">Equipped</span></div><div class="it">%s<b>Copper</b><button class="price">$0.99</button></div><div class="it opt"><em>OPTIONAL</em>%s<b>Helper robot</b><button class="price alt">Enable</button></div></div>' % (toolbox_svg('classic', 70), toolbox_svg('brass', 70), OLD['mini_bot']('classic'))
        + '<h4>Decor styles</h4><div class="g3"><div class="it"><i class="sw" style="--c:#2f8f8a"></i><b>Coastal</b><span class="own">Free</span></div><div class="it"><i class="sw" style="--c:#a8693a"></i><b>Classic</b><button class="price">$1.49</button></div><div class="it"><i class="sw" style="--c:#4a4f57"></i><b>Modern</b><button class="price">$1.49</button></div></div>'
        + '<h4>Coins</h4><div class="g4">%s</div>' % coins_html
        + '<div class="g2"><div class="it"><b>Remove ads</b><small>Forever · optional rewards stay</small><button class="price">$2.99</button></div><div class="it"><b>50 free coins</b><small>Watch a short ad</small><button class="price alt">%s Watch</button></div></div></div>' % I['film'])

SCREENS = [('Home · The house on the cliff', home), ('Room · Before', before), ('Room · After', after), ('Puzzle · Rug cleaning', rug_scr),
           ('Puzzle · Wood cutting', wood_scr), ('Puzzle · Garden planning', garden_scr), ('Task complete', win), ('House areas', areas), ('Shop', shop)]
CSS = open('/home/user/oya-agent-agent/design/house-game-en/fonts/fonts.css').read() + open('/home/user/oya-agent-agent/design/house-game-en/style.css').read()
html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><style>%s</style></head><body>%s</body></html>' % (
    CSS, ''.join('<div class="ph" id="s%d"><div class="cap">%s</div><div class="scr">%s</div></div>' % (i + 1, t, b) for i, (t, b) in enumerate(SCREENS)))
open(OUT, 'w').write(html)
print('ok', len(SCREENS))
