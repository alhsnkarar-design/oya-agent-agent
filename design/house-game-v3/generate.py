# v3 redesign: "dusk & lantern" — dark glass UI with gold accents, detailed isometric dioramas, redrawn puzzles.
import math, random

OUT = '/home/user/oya-agent-agent/design/house-game-v3/house-v3.html'
GOLD, GOLD2, CREAM, INK = '#f3c969', '#d9a03a', '#f7ecd8', '#0e1626'


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join('%02x' % round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def P(pts):
    return ' '.join('%.1f,%.1f' % p for p in pts)


def poly(pts, fill, stroke=None, sw=1.0, extra=''):
    st = stroke if stroke else fill
    return '<polygon points="%s" fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round" %s/>' % (P(pts), fill, st, sw, extra)


# ---------------- isometric engine ----------------
class Iso:
    def __init__(self, ox, oy, s):
        self.ox, self.oy, self.s = ox, oy, s

    def __call__(self, x, y, z=0):
        return self.ox + (x - y) * .866 * self.s, self.oy + (x + y) * .5 * self.s - z * self.s

    def box(self, x, y, z, w, d, h, col, edge=.9, tex=None):
        p = self
        T = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)]
        R = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)]
        L = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)]
        top, left, right = mix(col, '#ffffff', .16), col, mix(col, '#000000', .24)
        o = poly(L, left, None, edge) + poly(R, right, None, edge) + poly(T, top, None, edge)
        o += '<polyline points="%s" fill="none" stroke="#ffffff" stroke-opacity=".25" stroke-width="1"/>' % P([T[3], T[2], T[1]])
        if tex:
            for f in (L, R, T):
                o += '<polygon points="%s" fill="url(#%s)" opacity=".55"/>' % (P(f), tex)
        return o

    def quad(self, x, y, w, d, col, z=0, extra=''):
        p = self
        return poly([p(x, y, z), p(x + w, y, z), p(x + w, y + d, z), p(x, y + d, z)], col, None, .6, extra)

    def ao(self, x, y, w, d, op=.32):
        p = self
        return '<polygon points="%s" fill="#140c06" opacity="%s" filter="url(#b5)"/>' % (P([p(x - .15, y - .15), p(x + w + .35, y - .15), p(x + w + .35, y + d + .35), p(x - .15, y + d + .35)]), op)

    def wallx(self, y, z):          # left wall plane x=0
        return self(0, y, z)

    def wally(self, x, z):          # right wall plane y=0
        return self(x, 0, z)


D, HW = 10.0, 6.0


def rug_pattern(p, x, y, w, d, dirty=False):
    """Detailed rug lying on the floor in iso space."""
    o = [p.ao(x, y, w, d, .2), p.quad(x, y, w, d, '#8f3530')]
    b = .45
    o.append(p.quad(x + b, y + b, w - 2 * b, d - 2 * b, '#24365a'))
    o.append(p.quad(x + b + .18, y + b + .18, w - 2 * b - .36, d - 2 * b - .36, '#efe0c2'))
    for k in range(int(w / .55)):
        cx = x + .3 + k * .55
        for cy in (y + b / 2, y + d - b / 2):
            o.append(poly([p(cx, cy - .14), p(cx + .14, cy), p(cx, cy + .14), p(cx - .14, cy)], GOLD2))
    for k in range(int(d / .55)):
        cy = y + .3 + k * .55
        for cx in (x + b / 2, x + w - b / 2):
            o.append(poly([p(cx, cy - .14), p(cx + .14, cy), p(cx, cy + .14), p(cx - .14, cy)], GOLD2))
    cx, cy = x + w / 2, y + d / 2
    for s, c in [(1.75, '#24365a'), (1.4, GOLD2), (1.05, '#9e3b33'), (.68, '#efe0c2'), (.36, '#3a8a86')]:
        o.append(poly([p(cx - s, cy), p(cx, cy - s * .82), p(cx + s, cy), p(cx, cy + s * .82)], c))
    for (qx, qy) in [(x + b + .2, y + b + .2), (x + w - b - .2, y + b + .2), (x + b + .2, y + d - b - .2), (x + w - b - .2, y + d - b - .2)]:
        o.append(poly([p(qx - .5, qy), p(qx, qy - .5), p(qx + .5, qy), p(qx, qy + .5)], '#3a8a86'))
    for k in range(int(w / .2)):
        a, bb = p(x + .1 + k * .2, y + d), p(x + .1 + k * .2, y + d + .22)
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#e9dcc0" stroke-width="1"/>' % (*a, *bb))
    if dirty:
        o.append('<polygon points="%s" fill="#4a3220" opacity=".78"/>' % P([p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)]))
        o.append('<polygon points="%s" fill="#000" filter="url(#mud)"/>' % P([p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)]))
        sx, sy = p(x + 1.6, y + 3.2)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="22" ry="10" fill="#2a1a0c" opacity=".7"/>' % (sx, sy))
        sx, sy = p(x + 4.4, y + 1.4)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="14" ry="7" fill="#1e2a55" opacity=".7"/>' % (sx, sy))
    return ''.join(o)


def plant_iso(p, x, y, s=1.0, pot='#c9764e'):
    o = [p.ao(x, y, .7 * s, .7 * s, .3), p.box(x, y, 0, .7 * s, .7 * s, .75 * s, pot)]
    tx, ty = p(x + .35 * s, y + .35 * s, .75 * s)
    for a, ln, c in [(-62, 36, '#2f6f45'), (-30, 44, '#3f8a55'), (0, 40, '#4f9f62'), (28, 46, '#3f8a55'), (60, 34, '#2f6f45'), (-10, 30, '#68b877')]:
        r = math.radians(a - 90)
        ex, ey = tx + math.cos(r) * ln * s, ty + math.sin(r) * ln * s
        nx, ny = -math.sin(r) * 10 * s, math.cos(r) * 10 * s
        o.append('<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f Q%.1f %.1f %.1f %.1f Z" fill="%s"/>' % (tx, ty, (tx + ex) / 2 + nx, (ty + ey) / 2 + ny, ex, ey, (tx + ex) / 2 - nx, (ty + ey) / 2 - ny, tx, ty, c))
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#ffffff" stroke-opacity=".18" stroke-width="1"/>' % (tx, ty, ex, ey))
    return ''.join(o)


def room(state):
    B = state == 'before'
    p = Iso(195, 250, 26)
    rng = random.Random(5)
    o = []
    # slab
    o.append('<polygon points="%s" fill="#000" opacity=".45" filter="url(#b14)"/>' % P([p(0, D, -1.1), p(D, D, -1.1), p(D, 0, -1.1), p(D + 1.2, D + 1.2, -2.2)]))
    o.append(poly([p(0, D, 0), p(D, D, 0), p(D, D, -.9), p(0, D, -.9)], '#5b4330' if not B else '#3a3029'))
    o.append(poly([p(D, 0, 0), p(D, D, 0), p(D, D, -.9), p(D, 0, -.9)], '#47331f' if not B else '#2c241e'))
    o.append(poly([p(0, D, -.9), p(D, D, -.9), p(D, D, -.75), p(0, D, -.75)], '#3a2a1a', None, .5, 'opacity=".6"'))
    # floor planks with tone variation
    for i in range(14):
        y0, y1 = i * D / 14, (i + 1) * D / 14
        xs = [0] + sorted(rng.uniform(1, 9) for _ in range(2)) + [D]
        for a, bx in zip(xs, xs[1:]):
            base = '#cf9a62' if not B else '#7b6450'
            col = mix(base, '#000000' if rng.random() < .5 else '#ffffff', rng.uniform(0, .08))
            if B and rng.random() < .06:
                col = '#2a2420'
            o.append(poly([p(a, y0), p(bx, y0), p(bx, y1), p(a, y1)], col, mix(col, '#000000', .25), .6))
    o.append('<polygon points="%s" fill="url(#grainF)" opacity="%s"/>' % (P([p(0, 0), p(D, 0), p(D, D), p(0, D)]), .35))
    # walls
    wl, wr = ('#9cc2b4', '#b4d4c6') if not B else ('#6f7a76', '#7f8a85')
    L = [p(0, 0, 0), p(0, D, 0), p(0, D, HW), p(0, 0, HW)]
    R = [p(0, 0, 0), p(D, 0, 0), p(D, 0, HW), p(0, 0, HW)]
    o.append(poly(L, wl))
    o.append(poly(R, wr))
    for f in (L, R):
        o.append('<polygon points="%s" fill="url(#%s)"/>' % (P(f), 'wpNew' if not B else 'wpOld'))
    # wainscot lower panels
    wc = '#f3ead9' if not B else '#8d8577'
    o.append(poly([p(0, 0, 0), p(0, D, 0), p(0, D, 1.5), p(0, 0, 1.5)], mix(wc, '#000000', .06)))
    o.append(poly([p(0, 0, 0), p(D, 0, 0), p(D, 0, 1.5), p(0, 0, 1.5)], wc))
    for k in range(1, 10):
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1" opacity=".5"/>' % (*p(k, 0, .1), *p(k, 0, 1.4), mix(wc, '#000000', .2)))
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1" opacity=".5"/>' % (*p(0, k, .1), *p(0, k, 1.4), mix(wc, '#000000', .25)))
    o.append(poly([p(0, 0, 1.5), p(D, 0, 1.5), p(D, 0, 1.62), p(0, 0, 1.62)], '#ffffff' if not B else '#9a9284'))
    o.append(poly([p(0, 0, 1.5), p(0, D, 1.5), p(0, D, 1.62), p(0, 0, 1.62)], '#f1ebe0' if not B else '#8a8274'))
    # wall caps
    cap = '#f7f0e4' if not B else '#a39b8e'
    o.append(poly([p(0, 0, HW), p(D, 0, HW), p(D, -.3, HW), p(-.3, -.3, HW), p(-.3, D, HW), p(0, D, HW)], cap))
    o.append(poly([p(-.3, D, HW), p(0, D, HW), p(0, D, -.9), p(-.3, D, -.9)], mix(cap, '#000000', .2)))
    o.append(poly([p(D, -.3, HW), p(D, 0, HW), p(D, 0, -.9), p(D, -.3, -.9)], mix(cap, '#000000', .32)))
    if B:
        for (a, b2, c, d2) in [(.6, 3.4, 1.8, 4.6), (6.2, 2.4, 7.8, 3.8)]:
            o.append(poly([p(0, a, b2), p(0, c, b2 + .3), p(0, c - .3, d2), p(0, a + .2, d2 - .2)], '#5d6662'))
        o.append('<path d="M%.1f %.1f l6 14 l-5 10 l8 18" stroke="#3a3f3c" stroke-width="1.4" fill="none"/>' % p(9, 0, 5.4))
    # arched window on right wall
    x0, x1, z0, z1 = 5.3, 8.9, 1.9, 4.6
    arch = [p(x0, 0, z0), p(x1, 0, z0), p(x1, 0, z1)] + [p((x0 + x1) / 2 + math.cos(a) * (x1 - x0) / 2, 0, z1 + math.sin(a) * .9) for a in [k * math.pi / 12 for k in range(1, 12)]] + [p(x0, 0, z1)]
    o.append(poly(arch, 'url(#duskWin)' if not B else 'url(#nightWin)'))
    hz = p(x0, 0, z0 + 1.1), p(x1, 0, z0 + 1.1)
    o.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="6" stroke-linejoin="round"/>' % (P(arch + [arch[0]]), '#fbf4e8' if not B else '#4f4336'))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="4"/>' % (*p((x0 + x1) / 2, 0, z0), *p((x0 + x1) / 2, 0, z1 + .9), '#fbf4e8' if not B else '#4f4336'))
    o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="4"/>' % (*p(x0, 0, z0 + 1.4), *p(x1, 0, z0 + 1.4), '#fbf4e8' if not B else '#4f4336'))
    o.append(poly([p(x0 - .3, 0, z0), p(x1 + .3, 0, z0), p(x1 + .3, .45, z0), p(x0 - .3, .45, z0)], '#fbf4e8' if not B else '#5a4d3e'))
    if B:
        for z, dz in [(2.4, .35), (3.3, -.3), (4.2, .25)]:
            o.append(poly([p(x0 - .4, 0, z), p(x1 + .4, 0, z + dz), p(x1 + .4, 0, z + dz + .38), p(x0 - .4, 0, z + .38)], '#7a5c3c', '#3d2a18', .8))
            for xx in (x0 - .1, x1 + .1):
                o.append('<circle cx="%.1f" cy="%.1f" r="1.6" fill="#222"/>' % p(xx, 0, z + .2 + (dz if xx > x0 else 0)))
    else:
        for cx0, cx1 in [(x0 - .7, x0 - .05), (x1 + .05, x1 + .7)]:
            o.append(poly([p(cx0, 0, z1 + 1.2), p(cx1, 0, z1 + 1.2), p(cx1 + .1, 0, .3), p(cx0 - .1, 0, .3)], '#e9b39b', '#cf9580', .8))
            for k in range(3):
                xx = cx0 + (cx1 - cx0) * (k + .5) / 3
                o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#cf9580" stroke-width="1"/>' % (*p(xx, 0, z1 + 1.1), *p(xx, 0, .4)))
        o.append(poly([p(x0 - .9, 0, z1 + 1.3), p(x1 + .9, 0, z1 + 1.3), p(x1 + .9, .12, z1 + 1.3), p(x0 - .9, .12, z1 + 1.3)], '#b98a5a'))
    # light beam from window onto the floor
    beam = [p(x0, .45, z0), p(x1, .45, z0), p(x1 - .6, 5.6, 0), p(x0 - 1.6, 5.6, 0)]
    o.append('<polygon points="%s" fill="url(#%s)" style="mix-blend-mode:screen"/>' % (P(beam), 'beamWarm' if not B else 'beamMoon'))
    # fireplace + mantle
    o.append(p.ao(1.0, 0, 3.4, 1.1))
    o.append(p.box(1.2, 0, 0, 3.0, .9, 3.0, '#e4d8c4' if not B else '#77716a', tex='stone'))
    o.append(p.box(.95, 0, 3.0, 3.5, 1.15, .22, '#8a5a32' if not B else '#4a3f33'))
    o.append(poly([p(2.0, .9, 0), p(3.4, .9, 0), p(3.4, .9, 1.5)] + [p(2.7 + math.cos(a) * .7, .9, 1.5 + math.sin(a) * .5) for a in [k * math.pi / 8 for k in range(1, 8)]] + [p(2.0, .9, 1.5)], '#1b1714'))
    if not B:
        fx, fy = p(2.7, .9, .4)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="46" ry="30" fill="url(#fireGlow)" style="mix-blend-mode:screen"/>' % (fx, fy))
        o.append('<path d="M%.1f %.1f q-8 -13 2 -24 q2 11 8 5 q4 -10 -2 -18 q15 11 11 28 q5 -4 5 -11 q8 13 -4 20z" fill="#ffb02e"/><path d="M%.1f %.1f q-4 -8 2 -13 q4 7 6 2 q5 8 -2 11z" fill="#fff1b0"/>' % (fx - 10, fy + 8, fx - 2, fy + 8))
        o.append(p.box(1.5, .3, 3.22, .5, .5, .9, '#3a5a7a') + p.box(3.4, .3, 3.22, .35, .35, .55, '#f3ead9'))
        cx, cy = p(2.6, .5, 3.9)
        o.append('<circle cx="%.1f" cy="%.1f" r="11" fill="#fbf4e8" stroke="#b07a3a" stroke-width="3"/><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="1.6"/><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#333" stroke-width="1.4"/>' % (cx, cy, cx, cy, cx, cy - 7, cx, cy, cx + 5, cy + 2))
    else:
        o.append('<path d="M%.1f %.1f l10 -5 l9 3 l8 -4" stroke="#6a645c" stroke-width="3" fill="none"/>' % p(2.2, .9, .1))
    # bookshelf on left wall
    o.append(p.ao(0, 1.3, .9, 3.6))
    o.append(p.box(0, 1.3, 0, .85, 3.5, 4.8, '#7a4d2a' if not B else '#3f2e22', tex='woodV'))
    for z in (.45, 1.55, 2.65, 3.7):
        y = 1.45
        while y < 4.65:
            dy = rng.uniform(.18, .3)
            if B and rng.random() < .45:
                y += dy
                continue
            col = rng.choice(['#b5473a', '#2f6f95', '#d8a443', '#3e7f5a', '#7c5aa6', '#e7d9bd']) if not B else rng.choice(['#5d5246', '#4f4d47', '#64584a'])
            ht = rng.uniform(.7, .95)
            o.append(poly([p(.85, y, z), p(.85, y + dy, z), p(.85, y + dy, z + ht), p(.85, y, z + ht)], col, mix(col, '#000000', .4), .5))
            y += dy + .02
    # painting + sconce on left wall
    o.append(poly([p(0, 6.0, 2.6), p(0, 8.6, 2.6), p(0, 8.6, 4.6), p(0, 6.0, 4.6)], '#c9a463' if not B else '#3b2a1d'))
    o.append(poly([p(0, 6.2, 2.8), p(0, 8.4, 2.8), p(0, 8.4, 4.4), p(0, 6.2, 4.4)], 'url(#duskPaint)' if not B else '#4a4840'))
    if not B:
        sx, sy = p(0, 5.4, 3.9)
        o.append('<circle cx="%.1f" cy="%.1f" r="34" fill="url(#lampGlow)" style="mix-blend-mode:screen"/><path d="M%.1f %.1f h12 l-3 -12 h-6z" fill="#fff1c9" stroke="#d9b770"/>' % (sx, sy, sx - 6, sy + 4))
    # rug
    o.append(rug_pattern(p, 2.3, 3.4, 6.0, 4.9, dirty=B))
    # furniture (depth sorted)
    items = []
    if not B:
        sofa = (p.ao(2.75, 3.0, 5.15, 1.7) + p.box(2.95, 3.0, 0, 4.7, 1.6, .75, '#36817a') + p.box(2.95, 3.0, .75, 4.7, .45, 1.25, '#2f766f')
                + p.box(2.7, 3.0, 0, .3, 1.6, 1.15, '#2b6d67') + p.box(7.65, 3.0, 0, .3, 1.6, 1.15, '#2b6d67')
                + p.box(3.05, 3.5, .75, 2.25, 1.05, .22, '#4a958d') + p.box(5.35, 3.5, .75, 2.25, 1.05, .22, '#4a958d')
                + p.box(3.4, 3.45, .97, 1.0, .3, .75, '#e8b64a') + p.box(6.4, 3.45, .97, 1.0, .3, .75, '#e38a6c')
                + poly([p(7.0, 3.0, 2.0), p(7.95, 3.0, 2.0), p(7.95, 4.6, 1.15), p(7.95, 4.6, .2), p(7.4, 4.6, .2), p(7.4, 4.6, .97), p(7.0, 3.6, 1.5)], '#f1e3c4', '#d8c7a4', 1))
        items.append((5.0, sofa))
        table = p.ao(4.4, 6.0, 2.0, 1.2) + p.box(4.4, 6.0, 0, 2.0, 1.2, .7, '#a8693a', tex='woodH')
        table += p.box(4.6, 6.2, .7, .7, .5, .22, '#3a5a7a') + p.box(4.62, 6.22, .92, .62, .46, .14, '#e7d9bd')
        for cx_, cy_ in [(5.7, 6.5), (6.05, 6.75)]:
            a, b_ = p(cx_, cy_, .7)
            table += '<ellipse cx="%.1f" cy="%.1f" rx="6" ry="3.4" fill="#fbf4e8"/><rect x="%.1f" y="%.1f" width="12" height="6" rx="2" fill="#fbf4e8"/><ellipse cx="%.1f" cy="%.1f" rx="5" ry="2.6" fill="#7a4a22"/>' % (a, b_ - 6, a - 6, b_ - 6, a, b_ - 6)
        items.append((7.2, table))
        chair = p.ao(8.1, 5.5, 1.7, 1.7) + p.box(8.2, 5.6, 0, 1.5, 1.5, .7, '#d9a03a') + p.box(9.35, 5.6, .7, .35, 1.5, 1.05, '#c48e2e') + p.box(8.3, 5.7, .7, 1.0, 1.3, .2, '#e8b64a')
        items.append((7.8, chair))
        lb = p(1.3, 1.6)
        items.append((2.9, '<ellipse cx="%.1f" cy="%.1f" rx="70" ry="44" fill="url(#lampGlow)" style="mix-blend-mode:screen"/>' % (lb[0], lb[1] - 12)
                      + '<ellipse cx="%.1f" cy="%.1f" rx="10" ry="4" fill="#2b2620"/><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#2b2620" stroke-width="3"/><path d="M%.1f %.1f h30 l-8 -24 h-14z" fill="#fff1c9" stroke="#d9b770"/>' % (lb[0], lb[1], lb[0], lb[1], lb[0], lb[1] - 100, lb[0] - 15, lb[1] - 96)))
        items.append((17.0, plant_iso(p, 8.9, 8.6, 1.0)))
        items.append((9.6, plant_iso(p, .5, 8.8, .9, '#7c8fa8')))
        bk = p.ao(8.6, 1.2, 1.0, 1.0) + p.box(8.6, 1.2, 0, 1.0, 1.0, .7, '#b08a5c', tex='weave') + p.box(8.7, 1.3, .7, .8, .8, .15, '#e38a6c')
        items.append((9.8, bk))
    else:
        sheet = p.ao(2.75, 3.0, 5.15, 1.7) + p.box(2.7, 3.0, 0, 5.25, 1.6, 1.2, '#b5afa2') + p.box(2.7, 3.0, 1.2, 5.25, .5, .9, '#c2bcae')
        for k in range(5):
            a, b_ = p(3.2 + k * .95, 4.6, 1.15), p(3.0 + k * .95, 4.6, .1)
            sheet += '<path d="M%.1f %.1f Q%.1f %.1f %.1f %.1f" stroke="#968f82" stroke-width="1.6" fill="none"/>' % (a[0], a[1], a[0] + 6, (a[1] + b_[1]) / 2, b_[0], b_[1])
        items.append((5.0, sheet))
        items.append((7.2, p.ao(4.4, 6.0, 2.0, 1.2) + p.box(4.4, 6.0, 0, 2.0, 1.2, .7, '#5a4030', tex='woodH') + p.box(4.7, 6.2, .7, 1.2, .8, .05, '#9a948a')))
        items.append((7.8, p.ao(8.1, 5.5, 1.7, 1.7) + p.box(8.2, 5.6, 0, 1.5, 1.5, .7, '#6e6150') + p.box(9.35, 5.6, .7, .35, 1.5, 1.05, '#5f5446')
                      + ''.join('<circle cx="%.1f" cy="%.1f" r="%d" fill="#e8e2d6"/>' % (*p(8.7 + k * .25, 6.1 + k * .2, .72), 4 - k) for k in range(3))))
        boxes = p.ao(7.4, 7.6, 1.6, 1.4) + p.box(7.5, 7.7, 0, 1.3, 1.1, .9, '#a88459', tex='card') + p.box(7.65, 7.85, .9, 1.0, .85, .7, '#9a7a50', tex='card')
        items.append((15.2, boxes))
        bucket = p(6.2, 1.8)
        items.append((8.0, '<ellipse cx="%.1f" cy="%.1f" rx="34" ry="13" fill="#6f8c99" opacity=".55"/>' % (bucket[0] + 8, bucket[1] + 6)
                      + p.box(6.0, 1.6, 0, .5, .5, .55, '#7d8b98')
                      + '<path d="M%.1f 0 v6 m0 14 v5 m0 14 v4" stroke="#9cc4d6" stroke-width="2.2" stroke-linecap="round"/>' % p(6.25, 1.85, 6)[0]))
        for k in range(10):
            lx, ly = p(rng.uniform(1, 9), rng.uniform(5, 9.6))
            items.append((0, '<path d="M%.1f %.1f q5 -6 10 0 q-5 5 -10 0z" fill="%s" transform="rotate(%d %.1f %.1f)"/>' % (lx, ly, rng.choice(['#8a6a3a', '#a37a42', '#6f5a36']), rng.randint(0, 180), lx, ly)))
        for k in range(3):
            items.append((9.0, p.box(1.2 + k * .4, 5.2 + k * .2, 0, .3, .6, .08, rng.choice(['#5d5246', '#64584a']))))
    for _, s in sorted(items, key=lambda t: t[0]):
        o.append(s)
    # mood overlays
    if B:
        o.append('<rect x="-50" y="-50" width="500" height="900" fill="#3b4f7a" style="mix-blend-mode:multiply" opacity=".55"/>')
        for k in range(40):
            o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#dfe8ff" opacity="%.2f"/>' % (rng.uniform(150, 320), rng.uniform(150, 420), rng.uniform(.6, 1.8), rng.uniform(.2, .6)))
        for cx_, cy_, fl in [(p(0, 0, HW)[0] + 2, p(0, 0, HW)[1] + 2, 1), (p(D, 0, HW)[0] - 2, p(D, 0, HW)[1] + 2, -1)]:
            o.append(''.join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#e8e4da" stroke-width=".7" opacity=".55"/>' % (cx_, cy_, cx_ + fl * math.cos(math.radians(a)) * 44, cy_ + math.sin(math.radians(a)) * 44) for a in range(15, 170, 25)))
    else:
        o.append('<rect x="-50" y="-50" width="500" height="900" fill="#ffcf8a" style="mix-blend-mode:soft-light" opacity=".35"/>')
        for k in range(26):
            o.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff3c4" opacity="%.2f"/>' % (rng.uniform(230, 330), rng.uniform(180, 380), rng.uniform(.6, 1.6), rng.uniform(.25, .7)))
    return ''.join(o)


# ---------------- home: dusk island ----------------
def island():
    p = Iso(190, 452, 12.5)
    rng = random.Random(11)
    o = []
    # rocks in the sea
    for x, y, r in [(-3.5, 12, 14), (17.5, 4, 11), (15, 17.5, 16), (-1, 18.5, 9)]:
        cx, cy = p(x, y, 0)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="%d" ry="%d" fill="#2b3346"/><ellipse cx="%.1f" cy="%.1f" rx="%d" ry="%d" fill="#3d4760"/><ellipse cx="%.1f" cy="%.1f" rx="%d" ry="3" fill="#e9eef5" opacity=".35"/>' % (cx, cy, r, r * .6, cx - 2, cy - 3, r * .7, r * .4, cx, cy + r * .45, r * 1.3))
    # island block with strata
    o.append('<polygon points="%s" fill="#000" opacity=".4" filter="url(#b14)"/>' % P([p(-2, 16, -6), p(16, 16, -6), p(16, -2, -6), p(18, 18, -7)]))
    for i, (z0, z1, c1, c2) in enumerate([(0, -1.6, '#9a7a58', '#7d5f42'), (-1.6, -3.6, '#86684a', '#6a4f36'), (-3.6, -6, '#6f5540', '#553f2e')]):
        o.append(poly([p(-2, 16, z0), p(16, 16, z0), p(16, 16, z1), p(-2, 16, z1)], c1))
        o.append(poly([p(16, -2, z0), p(16, 16, z0), p(16, 16, z1), p(16, -2, z1)], c2))
    for k in range(14):
        z = -rng.uniform(.3, 5.6)
        x = rng.uniform(-1.5, 15)
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#3a2a1c" stroke-width="1.3" opacity=".45"/>' % (*p(x, 16, z), *p(x + rng.uniform(.8, 2.4), 16, z)))
    o.append('<path d="M%.1f %.1f %s" stroke="#e9eef5" stroke-width="2" fill="none" opacity=".5"/>' % (*p(-2, 16, -6), ' '.join('L%.1f %.1f' % p(-2 + k * 1.5, 16 + (k % 2) * .15, -6) for k in range(13))))
    # grass top
    o.append(p.quad(-2, -2, 18, 18, '#7fae5c'))
    o.append('<polygon points="%s" fill="url(#grassTex)" opacity=".6"/>' % P([p(-2, -2), p(16, -2), p(16, 16), p(-2, 16)]))
    o.append(poly([p(-2, 16, 0), p(16, 16, 0), p(16, 16, -.55), p(-2, 16, -.55)], '#5f8d43'))
    o.append(poly([p(16, -2, 0), p(16, 16, 0), p(16, 16, -.55), p(16, -2, -.55)], '#4e7a37'))
    # path and fence
    for k in range(7):
        o.append(p.quad(6.4 + (k % 2) * .2, 10 + k * .85, 1.2, .6, '#e3cfa4'))
    for k in range(9):
        x = 8.4 + k * .85
        o.append(p.box(x, 15.3, 0, .14, .14, .9, '#efe6d6'))
    o.append(poly([p(8.4, 15.37, .7), p(15.3, 15.37, .7), p(15.3, 15.37, .58), p(8.4, 15.37, .58)], '#efe6d6'))
    # house body (left weathered, right restored)
    o.append(p.ao(.8, .8, 10.6, 8.9, .45))
    o.append(p.box(1, 1, 0, 10, 8.5, 6, '#f1e5cf'))
    o.append(p.box(1, 1, 0, 4.6, 8.5, 6, '#a39a88'))
    for k in range(10):
        z = .5 + k * .55
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#000" stroke-opacity=".07" stroke-width="1"/>' % (*p(5.6, 9.5, z), *p(11, 9.5, z)))
    # roof
    rz, rr = 6, 9.4
    o.append(poly([p(.4, 10.1, rz), p(11.6, 10.1, rz), p(11.6, 5.25, rr), p(.4, 5.25, rr)], '#b5523d'))
    for k in range(9):
        o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#8a3a2a" stroke-width="1.2" opacity=".6"/>' % (*p(.4, 10.1 - k * .54, rz + k * .38), *p(11.6, 10.1 - k * .54, rz + k * .38)))
    o.append(poly([p(.4, 10.1, rz), p(5.6, 10.1, rz), p(5.6, 5.25, rr), p(.4, 5.25, rr)], '#5d5550'))
    o.append(poly([p(2.2, 8.4, 6.9), p(3.6, 8.4, 6.9), p(3.6, 7.4, 7.6), p(2.2, 7.4, 7.6)], '#2c2a2e'))
    o.append(poly([p(11.6, .6, rz), p(11.6, 10.1, rz), p(11.6, 5.25, rr)], '#e8d8bc'))
    o.append(p.box(7.6, 3.4, 7.6, 1.1, 1.1, 3.0, '#8d7d6c'))
    o.append('<path d="M%.1f %.1f q-6 -14 4 -26 q-8 -10 2 -22" stroke="#d9d6e8" stroke-width="5" stroke-linecap="round" fill="none" opacity=".35"/>' % p(8.15, 3.95, 10.8))
    # windows
    for x0, ok in [(1.7, False), (3.5, False), (7.4, True), (9.2, True)]:
        for z0 in (.9, 3.4):
            q = [p(x0, 9.5, z0), p(x0 + 1.25, 9.5, z0), p(x0 + 1.25, 9.5, z0 + 1.7), p(x0, 9.5, z0 + 1.7)]
            if ok:
                cx, cy = p(x0 + .62, 9.5, z0 + .85)
                o.append('<circle cx="%.1f" cy="%.1f" r="26" fill="url(#winGlow)" style="mix-blend-mode:screen"/>' % (cx, cy))
                o.append(poly(q, '#ffd57a', '#fff7e6', 2.4))
                o.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#fff7e6" stroke-width="2"/>' % (*p(x0 + .62, 9.5, z0), *p(x0 + .62, 9.5, z0 + 1.7)))
            else:
                o.append(poly(q, '#232b36', '#4d4236', 2.4))
                o.append(poly([p(x0 - .2, 9.5, z0 + .5), p(x0 + 1.45, 9.5, z0 + .85), p(x0 + 1.45, 9.5, z0 + 1.15), p(x0 - .2, 9.5, z0 + .8)], '#7a5c3c'))
    for y0, ok in [(2.0, True), (5.6, False)]:
        q = [p(11, y0, 3.2), p(11, y0 + 1.5, 3.2), p(11, y0 + 1.5, 4.9), p(11, y0, 4.9)]
        o.append(poly(q, '#ffd57a' if ok else '#232b36', '#fff7e6' if ok else '#4d4236', 2.4))
    o.append(poly([p(6.0, 9.5, 0), p(7.3, 9.5, 0), p(7.3, 9.5, 2.5), p(6.0, 9.5, 2.5)], '#2f6f78', '#1d4d55', 1.5))
    lx, ly = p(6.65, 9.5, 2.9)
    o.append('<circle cx="%.1f" cy="%.1f" r="16" fill="url(#winGlow)" style="mix-blend-mode:screen"/><rect x="%.1f" y="%.1f" width="7" height="9" rx="2" fill="#ffd57a"/>' % (lx, ly, lx - 3.5, ly - 4.5))
    # gardens
    for x, y, r, c in [(.8, 12.3, 15, '#4c7436'), (2.5, 13.4, 12, '#557d3c'), (.1, 14.6, 11, '#456b31'), (3.8, 12.1, 9, '#4c7436'), (1.8, 11.2, 8, '#3f612b')]:
        cx, cy = p(x, y, 1.1)
        o.append('<ellipse cx="%.1f" cy="%.1f" rx="%d" ry="%.1f" fill="%s"/><ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#ffffff" opacity=".08"/>' % (cx, cy, r, r * .78, c, cx - r * .3, cy - r * .3, r * .4, r * .25))
    for x, y, c in [(9.2, 12.0, '#f49ab0'), (10.6, 12.4, '#ffd36a'), (12.0, 12.0, '#f49ab0'), (13.4, 12.4, '#fff6e8'), (9.9, 13.4, '#ffd36a'), (11.3, 13.6, '#f49ab0')]:
        cx, cy = p(x, y, .4)
        o.append('<circle cx="%.1f" cy="%.1f" r="6.5" fill="#3f7f4a"/><circle cx="%.1f" cy="%.1f" r="2.8" fill="%s"/><circle cx="%.1f" cy="%.1f" r="2.2" fill="%s"/>' % (cx, cy, cx + 2, cy - 3, c, cx - 3, cy - 1, c))
    # lighthouse
    bx, by = p(14.6, .8, 0)
    o.append('<ellipse cx="%.1f" cy="%.1f" rx="20" ry="8" fill="#000" opacity=".3" filter="url(#b5)"/>' % (bx, by + 2))
    o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="#f2ede4"/><path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="#d8d0c2"/>' % (bx - 15, by, bx - 9, by - 128, bx + 9, by - 128, bx + 15, by, bx, by, bx, by - 128, bx + 9, by - 128, bx + 15, by))
    for z0 in (30, 74):
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="#c4473b"/>' % (bx - 15 + z0 / 21.3, by - z0, bx + 15 - z0 / 21.3, by - z0, bx + 15 - (z0 + 20) / 21.3, by - z0 - 20, bx - 15 + (z0 + 20) / 21.3, by - z0 - 20))
    o.append('<rect x="%.1f" y="%.1f" width="26" height="6" rx="2" fill="#2b3346"/><rect x="%.1f" y="%.1f" width="18" height="16" rx="2" fill="#3a4658"/><path d="M%.1f %.1f l12 -12 l12 12z" fill="#2b3346"/>' % (bx - 13, by - 134, bx - 9, by - 150, bx - 12, by - 150))
    o.append('<rect x="%.1f" y="%.1f" width="10" height="10" rx="2" fill="#7f8ba0" opacity=".6"/>' % (bx - 5, by - 147))
    return ''.join(o)


DEFS = '''<defs>
<filter id="b5" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="b14" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="mud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .17  0 0 0 0 .09  0 0 0 1.7 -.6"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grainNoise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .5" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .18  0 0 0 0 .06  0 0 0 .7 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<pattern id="grainF" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 8 Q15 5 30 9 T60 8 M0 22 Q18 19 34 23 T60 22" stroke="#4a2a10" stroke-width=".6" fill="none" opacity=".5"/></pattern>
<pattern id="woodH" width="40" height="8" patternUnits="userSpaceOnUse"><path d="M0 2 Q10 1 20 3 T40 2 M0 6 Q12 5 22 7 T40 6" stroke="#3b200c" stroke-width=".7" fill="none" opacity=".5"/></pattern>
<pattern id="woodV" width="8" height="40" patternUnits="userSpaceOnUse"><path d="M2 0 Q1 10 3 20 T2 40" stroke="#2a160a" stroke-width=".7" fill="none" opacity=".5"/></pattern>
<pattern id="stone" width="22" height="14" patternUnits="userSpaceOnUse"><rect width="22" height="14" fill="none" stroke="#000" stroke-opacity=".18"/><rect x="11" y="7" width="22" height="14" fill="none" stroke="#000" stroke-opacity=".12"/></pattern>
<pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#5a4020" stroke-width=".8" opacity=".5"/></pattern>
<pattern id="card" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15h30" stroke="#6a4a24" stroke-width="2" opacity=".35"/></pattern>
<pattern id="wpNew" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 3 l3 7 l-3 7 l-3 -7z" fill="#ffffff" opacity=".22"/></pattern>
<pattern id="wpOld" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 3 l3 7 l-3 7 l-3 -7z" fill="#2a2f2c" opacity=".2"/></pattern>
<pattern id="grassTex" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M2 8 l1 -4 M7 9 l1 -5 M11 7 l1 -3" stroke="#a7d17f" stroke-width="1" opacity=".6"/></pattern>
<linearGradient id="duskWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5a8c"/><stop offset=".45" stop-color="#e79a7c"/><stop offset=".62" stop-color="#ffd59a"/><stop offset=".63" stop-color="#3e6f96"/><stop offset="1" stop-color="#22466a"/></linearGradient>
<linearGradient id="nightWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2540"/><stop offset=".6" stop-color="#2f3b62"/><stop offset=".61" stop-color="#18294a"/><stop offset="1" stop-color="#0f1b33"/></linearGradient>
<linearGradient id="duskPaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b48f"/><stop offset=".55" stop-color="#ffd9a8"/><stop offset=".56" stop-color="#3e7fa6"/><stop offset="1" stop-color="#26557a"/></linearGradient>
<linearGradient id="beamWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
<linearGradient id="beamMoon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cdf5" stop-opacity=".35"/><stop offset="1" stop-color="#b9cdf5" stop-opacity="0"/></linearGradient>
<radialGradient id="fireGlow"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".95"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/></radialGradient>
<radialGradient id="lampGlow"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>
<radialGradient id="winGlow"><stop offset="0" stop-color="#ffd57a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121c33"/><stop offset=".32" stop-color="#2a3b66"/><stop offset=".5" stop-color="#7b6a8e"/><stop offset=".6" stop-color="#e59a7e"/><stop offset=".64" stop-color="#ffcf98"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5f86"/><stop offset=".25" stop-color="#25395c"/><stop offset="1" stop-color="#0d1628"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff1c9"/><stop offset=".35" stop-color="#ffc98a" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>
<linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".5" stop-color="#f3c969"/><stop offset="1" stop-color="#c98f2a"/></linearGradient>
<linearGradient id="mat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a20"/><stop offset="1" stop-color="#241a14"/></linearGradient>
</defs>'''

# ---------------- icons (line, gold) ----------------
IC = {
    'sponge': '<rect x="4" y="7" width="16" height="11" rx="3"/><path d="M4 14h16"/><circle cx="9" cy="10.5" r=".6"/><circle cx="14" cy="10" r=".6"/>',
    'hammer': '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7 3 15l3 3 8-8"/>',
    'needle': '<path d="M5 19 19 5"/><circle cx="17.5" cy="6.5" r="1.4"/><path d="M5 19c4-1 7-4 6-8s3-6 6-5"/>',
    'wrench': '<path d="M14.5 5.5a4 4 0 0 0 4 5.5L11 18.5a2.1 2.1 0 0 1-3-3L15.5 8a4 4 0 0 1-1-2.5z"/>',
    'brush': '<path d="M14 4l6 6-7 7-6-6z"/><path d="M7 11l-3 9 9-3"/>',
    'home': '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/>',
    'map': '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    'book': '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-1 .2V20a2 2 0 0 1 2-2h5z"/>',
    'bag': '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    'gear': '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    'back': '<polyline points="15 18 9 12 15 6"/>',
    'pause': '<path d="M9 5v14M15 5v14"/>',
    'undo': '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    'bulb': '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    'rotate': '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    'camera': '<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.5"/>',
    'film': '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>',
    'lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'check': '<path d="M5 12l5 5 9-10"/>',
    'key': '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>',
    'saw': '<path d="M3 15 15 6l3 3-12 9z"/><path d="M15 6l3-2 3 3-3 2"/>',
    'sprout': '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
    'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'lighthouse': '<path d="M9 21l1.5-13h3L15 21z"/><path d="M8 8h8M10 5h4v3h-4z"/><path d="M4 6l3 1M20 6l-3 1"/>',
}


def ic(name, size=20, col='currentColor', sw=1.9):
    return '<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (size, size, col, sw, IC[name])


def star(sz, on=True):
    return ('<svg width="%d" height="%d" viewBox="0 0 24 24"><path d="M12 1.8l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.4 1.4-6.8-5.1-4.7 6.9-.8z" fill="%s" stroke="%s" stroke-width="1" stroke-linejoin="round"/>'
            '<path d="M12 4.6l1.9 4.2 4.5.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/></svg>') % (sz, sz, 'url(#goldG)' if on else 'rgba(255,255,255,.12)', '#a8741e' if on else 'rgba(255,255,255,.25)')


def coin(sz=18):
    return '<svg width="%d" height="%d" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="url(#goldG)" stroke="#a8741e"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#a8741e" stroke-opacity=".6"/><path d="M12 8.5v7" stroke="#a8741e" stroke-width="2" stroke-linecap="round"/></svg>' % (sz, sz)


def scene(svg, bg):
    return '<svg class="bg" viewBox="0 0 390 844" width="390" height="844">%s%s%s</svg>' % (DEFS, bg, svg)


def hud(left=None, title=None, sub=None, right=None):
    l = '<button class="gb">%s</button>' % ic(left) if left else ''
    mid = '<div class="tt"><small>%s</small><b>%s</b></div>' % (sub, title) if title else '<div class="sp"></div>'
    return '<div class="hud">%s%s%s</div>' % (l, mid, right or '')


def chips(coins='2,450', stars='38'):
    return '<div class="chip">%s<b>%s</b></div><div class="chip">%s<b>%s</b></div>' % (coin(), coins, star(17), stars)


def tabs(on):
    t = [('bag', 'Shop'), ('book', 'Journal'), ('home', 'House'), ('map', 'Map')]
    return '<nav class="tabs">%s</nav>' % ''.join('<button class="%s">%s<span>%s</span></button>' % ('on' if n == on else '', ic(k, 22), n) for k, n in t)


# =============== 1 HOME ===============
rng = random.Random(2)
stars_bg = ''.join('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff" opacity="%.2f"/>' % (rng.uniform(0, 390), rng.uniform(0, 300), rng.uniform(.4, 1.3), rng.uniform(.2, .8)) for _ in range(70))
sea_lines = ''.join('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="#ffc98a" stroke-opacity="%.2f" stroke-width="1.6" stroke-linecap="round"/>' % (190 - w, y, 190 + w, y, op) for y, w, op in [(420, 60, .7), (430, 44, .6), (442, 70, .45), (456, 36, .4), (472, 54, .3), (492, 30, .25)])
home_bg = '<rect width="390" height="844" fill="url(#sky)"/>%s<circle cx="190" cy="412" r="70" fill="url(#sun)"/><rect y="412" width="390" height="432" fill="url(#sea)"/>%s' % (stars_bg, sea_lines)
motes = ''.join('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#ffe2a8" opacity="%.2f"/>' % (rng.uniform(60, 330), rng.uniform(330, 560), rng.uniform(.8, 2), rng.uniform(.3, .8)) for _ in range(18))
home = (scene(island() + motes, home_bg)
        + hud(right=chips() + '<button class="gb">%s</button>' % ic('gear'))
        + '<div class="brand"><small>WORKING TITLE</small><h1>The Abandoned House</h1><p><i>Restore it. Uncover it.<br>Light the way home.</i></p></div>'
        + '<div class="glass prog"><div class="pr"><span>House restored</span><b>34%</b></div><div class="line"><i style="width:34%"></i><span style="left:34%">' + ic('lighthouse', 16, GOLD) + '</span></div><div class="pr sm"><span>Living Room · Task 4</span><span>2 of 11 secrets</span></div></div>'
        + '<button class="gold cta">Continue %s</button>' % ic('arrow', 20, INK, 2.2) + tabs('House'))

# =============== 2/3 ROOM ===============
pR = Iso(195, 250, 26)


def pin(x, y, n, name, on=False):
    return '<div class="pin%s" style="left:%.0fpx;top:%.0fpx">%s<i>%d</i></div>' % (' on' if on else '', x - 19, y - 19, ic(name, 18, INK if on else GOLD, 2), n)


pins = [(pR(5.3, 5.85, .2), 1, 'sponge', True), (pR(7.1, 0, 3.4), 2, 'hammer', False), (pR(5.2, 3.8, 2.4), 3, 'needle', False), (pR(2.7, .5, 2.4), 4, 'wrench', False), (pR(0, 7.3, 5.0), 5, 'brush', False)]
before = (scene('<g transform="translate(0 70)">%s</g>' % room('before'), '<rect width="390" height="844" fill="#0f1726"/><circle cx="195" cy="420" r="300" fill="#1c2a44" opacity=".8" filter="url(#b14)"/>')
          + hud('back', 'Living Room', 'AREA 2 · BEFORE', '<div class="chip">%s<b>0 / 5</b></div>' % ic('check', 16, GOLD))
          + ''.join(pin(x, y + 70, n, nm, on) for (x, y), n, nm, on in pins)
          + '<div class="sheet"><div class="grab"></div><div class="note"><small>%s FROM THE HOUSE JOURNAL</small><p>The rug was the first thing I bought for this house. Mud won’t hide its colours for long.</p></div>'
            '<div class="tasks"><div class="tk on">%s<b>Wash the rug</b><em>%s 1</em></div><div class="tk">%s<b>Open window</b><em>%s 1</em></div><div class="tk">%s<b>Mend sofa</b><em>%s 2</em></div><div class="tk off">%s<b>Fireplace</b><em>%s</em></div></div>'
            '<button class="gold cta in">Start · Wash the rug</button></div>'
          % (ic('book', 13, GOLD), ic('sponge', 22, INK), star(12), ic('hammer', 22, GOLD), star(12), ic('needle', 22, GOLD), star(12), ic('wrench', 22, GOLD), ic('lock', 13, '#8a93a6')))

after = (scene('<g transform="translate(0 70)">%s</g>' % room('after'), '<rect width="390" height="844" fill="#1a1724"/><circle cx="195" cy="420" r="300" fill="#4a3a3a" opacity=".7" filter="url(#b14)"/>')
         + hud('back', 'Living Room', 'AREA 2 · RESTORED', '<div class="chip gold-chip">%s<b>5 / 5</b></div>' % ic('check', 16, INK))
         + '<div class="sheet"><div class="grab"></div><div class="done"><h3>A room worth coming home to</h3><p>%s A small brass key was hidden behind the painting.</p></div>'
           '<div class="seg"><span>STYLE</span><i class="on" style="--c:#36817a">Coastal</i><i style="--c:#a8693a">Classic</i><i style="--c:#59606b">Modern</i></div>'
           '<div class="two"><button class="line-btn">%s Before / After</button><button class="gold cta in">Next: Kitchen</button></div></div>' % (ic('key', 16, GOLD), ic('camera', 18, GOLD)))


# =============== 4 RUG PUZZLE ===============
def rug_top(x, y, w, h, clean=.45, uid='r'):
    o = ['<g>']
    o.append('<rect x="%d" y="%d" width="%d" height="%d" rx="3" fill="#8f3530"/>' % (x, y, w, h))
    b = 30
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#24365a"/>' % (x + 10, y + 10, w - 20, h - 20))
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#8f3530"/>' % (x + 10 + b, y + 10 + b, w - 20 - 2 * b, h - 20 - 2 * b))
    for k in range(int((w - 20) / 26)):
        cx = x + 23 + k * 26
        for cy in (y + 10 + b / 2, y + h - 10 - b / 2):
            o.append('<path d="M%d %d l9 9 l-9 9 l-9 -9z" fill="%s"/><path d="M%d %d l4 4 l-4 4 l-4 -4z" fill="#8f3530"/>' % (cx, cy - 9, GOLD2, cx, cy - 4))
    for k in range(int((h - 20 - 2 * b) / 26)):
        cy = y + 10 + b + 13 + k * 26
        for cx in (x + 10 + b / 2, x + w - 10 - b / 2):
            o.append('<path d="M%d %d l9 9 l-9 9 l-9 -9z" fill="%s"/>' % (cx, cy - 9, GOLD2))
    fx, fy, fw, fh = x + 10 + b + 8, y + 10 + b + 8, w - 2 * (10 + b + 8), h - 2 * (10 + b + 8)
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="#efe0c2"/>' % (fx, fy, fw, fh))
    for r in range(int(fh / 30) + 1):
        for c in range(int(fw / 30) + 1):
            if (r + c) % 2:
                o.append('<path d="M%d %d l4 4 l-4 4 l-4 -4z" fill="#3a8a86" opacity=".7"/>' % (fx + 15 + c * 30, fy + 11 + r * 30))
    cx, cy = x + w / 2, y + h / 2
    for s, c in [(1, '#24365a'), (.8, GOLD2), (.6, '#9e3b33'), (.4, '#efe0c2'), (.22, '#3a8a86')]:
        o.append('<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f L%.1f %.1f Z" fill="%s"/>' % (cx, cy - fh * .42 * s, cx + fw * .42 * s, cy, cx, cy + fh * .42 * s, cx - fw * .42 * s, cy, c))
    for qx, qy in [(fx, fy), (fx + fw, fy), (fx, fy + fh), (fx + fw, fy + fh)]:
        o.append('<clipPath id="%sc%d%d"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath><path clip-path="url(#%sc%d%d)" d="M%d %d l38 38 l-38 38 l-38 -38z" fill="#24365a"/>' % (uid, qx, qy, fx, fy, fw, fh, uid, qx, qy, qx, qy - 38))
    for k in range(int(w / 5)):
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#e9dcc0" stroke-width="1.4"/><line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#e9dcc0" stroke-width="1.4"/>' % (x + 3 + k * 5, y, x + 3 + k * 5, y - 11, x + 3 + k * 5, y + h, x + 3 + k * 5, y + h + 11))
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="url(#weave)" opacity=".35"/>' % (x, y, w, h))
    if clean < 1:
        my = y + h * clean
        wave = ' '.join('Q%d %d %d %d' % (x + i * 30 + 15, my + (12 if i % 2 else -12), x + (i + 1) * 30, my) for i in range(w // 30 + 1))
        o.append('<clipPath id="%sm"><path d="M%d %d %s V%d H%d Z"/></clipPath>' % (uid, x, my, wave, y + h + 12, x))
        o.append('<g clip-path="url(#%sm)"><rect x="%d" y="%d" width="%d" height="%d" fill="#5a3e24" opacity=".86"/><rect x="%d" y="%d" width="%d" height="%d" fill="#000" filter="url(#mud)"/></g>' % (uid, x, y - 12, w, h + 24, x, y - 12, w, h + 24))
        o.append('<path d="M%d %d %s" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>' % (x, my, wave))
    o.append('</g>')
    return ''.join(o)


def blob(cx, cy, r, col, seed):
    rr = random.Random(seed)
    pts = [(cx + math.cos(a / 10 * 6.283) * r * rr.uniform(.75, 1.2), cy + math.sin(a / 10 * 6.283) * r * .85 * rr.uniform(.75, 1.2)) for a in range(10)]
    return '<path d="M%.1f %.1f %s Z" fill="%s"/>' % (pts[0][0], pts[0][1], ' '.join('Q%.1f %.1f %.1f %.1f' % (pts[i][0], pts[i][1], (pts[i][0] + pts[(i + 1) % 10][0]) / 2, (pts[i][1] + pts[(i + 1) % 10][1]) / 2) for i in range(10)), col)


def stain_tag(x, y, label, sel=False):
    return '<div class="stag%s" style="left:%dpx;top:%dpx">%s</div>' % (' sel' if sel else '', x, y, label)


def bottle(col, label, n, sel=False):
    return ('<div class="bt%s"><svg width="34" height="54" viewBox="0 0 34 54"><rect x="12" y="1" width="10" height="7" rx="2" fill="#2a3346"/><path d="M11 8h12v5l4 4v31a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V17l4-4z" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.45)"/>'
            '<path d="M8 26h18v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="%s"/><rect x="10" y="30" width="14" height="10" rx="2" fill="%s"/><path d="M10 18v24" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/></svg><b>%s</b><span>%d</span></div>'
            % (' sel' if sel else '', col, CREAM, label, n))


rug_bg = ('<rect width="390" height="844" fill="#101a2b"/><rect x="18" y="172" width="354" height="420" rx="26" fill="url(#mat)"/><rect x="18" y="172" width="354" height="420" rx="26" fill="url(#woodH)" opacity=".4"/>'
          '<rect x="18.5" y="172.5" width="353" height="419" rx="26" fill="none" stroke="rgba(243,201,105,.25)"/>')
rug_art = rug_top(56, 214, 278, 336, .43, 'ra') + blob(122, 280, 20, 'rgba(70,36,14,.88)', 3) + blob(282, 300, 14, 'rgba(28,38,96,.9)', 5) + blob(250, 490, 21, 'rgba(176,86,30,.85)', 7)
rug_art += ''.join('<circle cx="%d" cy="%d" r="%d" fill="#eef8ff" fill-opacity=".85" stroke="#bfe3f5" stroke-width="1"/><circle cx="%d" cy="%d" r="%.1f" fill="#fff"/>' % (x, y, r, x - r // 3, y - r // 3, r / 4) for x, y, r in [(270, 292, 8), (292, 306, 6), (281, 318, 5), (300, 290, 4), (262, 310, 4)])
rug_scr = (scene(rug_art, rug_bg)
           + hud('pause', 'Stain Chemistry', 'LIVING ROOM · THE RUG', '<div class="ring" style="--p:58"><b>58%</b></div>')
           + '<div class="steps"><i class="ok">%s Dust</i><i class="on">Stains</i><i>Wash</i><i>Rinse</i><i>Dry</i></div>' % ic('check', 12, INK, 3)
           + stain_tag(96, 248, 'Coffee') + stain_tag(262, 266, 'Ink', True) + stain_tag(226, 458, 'Rust')
           + '<div class="toolfloat" style="left:300px;top:226px"><svg width="44" height="62" viewBox="0 0 34 54" style="transform:rotate(-28deg)"><rect x="12" y="1" width="10" height="7" rx="2" fill="#2a3346"/><path d="M11 8h12v5l4 4v31a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V17l4-4z" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.6)"/><path d="M8 26h18v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill="#9b7bff"/></svg></div>'
           + '<div class="hintbar">%s <span>Ink won’t lift with water alone — try a solvent.</span></div>' % ic('bulb', 18, GOLD)
           + '<div class="dock"><div class="row">%s%s%s%s%s</div><div class="tools"><button class="gb">%s</button><button class="gb">%s</button><div class="st">%s%s%s</div></div></div>'
           % (bottle('#58b9e8', 'Warm water', 9), bottle('#f0b04f', 'Mild soap', 3), bottle('#9b7bff', 'Ink solvent', 2, True), bottle('#6fd39a', 'Baking soda', 2), bottle('#e7766a', 'Rust remover', 1),
              ic('undo'), ic('bulb'), star(20), star(20), star(20, False)))

# =============== 5 WOOD ===============
cell = 37
bx0, by0 = 28, 216


def wcell(c, r):
    return bx0 + c * cell, by0 + r * cell


wood = ['<rect x="%d" y="%d" width="%d" height="%d" rx="8" fill="#d6a067"/>' % (bx0, by0, 9 * cell, 5 * cell),
        '<rect x="%d" y="%d" width="%d" height="%d" rx="8" fill="#000" filter="url(#grainNoise)"/>' % (bx0, by0, 9 * cell, 5 * cell),
        '<rect x="%d" y="%d" width="%d" height="%d" rx="8" fill="none" stroke="#8a5a32" stroke-width="2"/>' % (bx0, by0, 9 * cell, 5 * cell)]
kx, ky = wcell(5.5, 2.5)
wood.append('<ellipse cx="%d" cy="%d" rx="14" ry="9" fill="#7a4a22"/><ellipse cx="%d" cy="%d" rx="7" ry="4" fill="#4a2a10"/><ellipse cx="%d" cy="%d" rx="20" ry="13" fill="none" stroke="#7a4a22" stroke-opacity=".5"/>' % (kx, ky, kx, ky, kx, ky))


def cut(c0, r0, c1, r1, lab, solid=True):
    x0, y0 = wcell(c0, r0); x1, y1 = wcell(c1, r1)
    if solid:
        return ('<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#f0c48e" fill-opacity=".55" stroke="%s" stroke-width="2.5"/><rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="url(#woodH)" opacity=".5"/>'
                '<text x="%d" y="%d" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="12" fill="#3a2410">%s</text>') % (x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6, INK, x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6, (x0 + x1) / 2, (y0 + y1) / 2 + 4, lab)
    return ('<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="rgba(243,201,105,.18)" stroke="%s" stroke-width="2.5" stroke-dasharray="7 5"/>'
            '<text x="%d" y="%d" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="12" fill="#5a3410">%s</text>') % (x0 + 3, y0 + 3, x1 - x0 - 6, y1 - y0 - 6, GOLD2, (x0 + x1) / 2, (y0 + y1) / 2 + 4, lab)


wood += [cut(0, 0, 5, 2, 'Table top'), cut(0, 2, 1, 5, 'Leg'), cut(1, 2, 2, 5, 'Leg'), cut(6, 0, 9, 2, 'Shelf', False)]
x0, y0 = wcell(5, 2)
wood.append('<rect x="%d" y="%d" width="%d" height="%d" rx="4" fill="#e7766a" fill-opacity=".25" stroke="#e7766a" stroke-width="2"/>' % (x0 + 3, y0 + 3, cell - 6, cell - 6))
wood.append('<path d="M%d %d h%d" stroke="%s" stroke-width="2" stroke-dasharray="3 4"/>' % (bx0, by0 - 14, 9 * cell, 'rgba(243,201,105,.6)'))
wood_bg = '<rect width="390" height="844" fill="#101a2b"/><rect x="14" y="196" width="362" height="222" rx="22" fill="url(#mat)"/>'


def iso_table():
    p = Iso(64, 58, 10)
    return ('<svg width="140" height="100" viewBox="0 0 140 100">' + p.ao(0, 0, 6, 3.5) + p.box(.2, .2, 0, .4, .4, 2.2, '#8a5a32') + p.box(5.2, .2, 0, .4, .4, 2.2, '#8a5a32') + p.box(.2, 2.9, 0, .4, .4, 2.2, '#8a5a32') + p.box(5.2, 2.9, 0, .4, .4, 2.2, '#8a5a32')
            + p.box(.2, .2, .7, 5.4, 3.1, .2, '#c88a52', tex='woodH') + p.box(0, 0, 2.2, 6, 3.5, .35, '#d9a46d', tex='woodH') + '</svg>')


def piece(shape, lab, n, sel=False, c=11):
    xs = [s[0] for s in shape]; ys = [s[1] for s in shape]
    w, h = (max(xs) + 1) * c, (max(ys) + 1) * c
    inner = ''.join('<rect x="%d" y="%d" width="%d" height="%d" rx="2" fill="#d9a46d" stroke="#8a5a32"/>' % (x * c, y * c, c - 1, c - 1) for x, y in shape)
    return '<div class="bt%s"><svg width="%d" height="%d" viewBox="-1 -1 %d %d">%s</svg><b>%s</b><span>%d</span></div>' % (' sel' if sel else '', w + 2, h + 2, w + 2, h + 2, inner, lab, n)


wood_scr = (scene(''.join(wood), wood_bg)
            + hud('pause', 'Plan the Cut', 'WORKSHOP · CARPENTRY', '<div class="ring" style="--p:22;--rc:#6fd39a"><b>7%</b></div>')
            + '<div class="cap2">WALNUT BOARD · 9 × 5 · AVOID THE KNOT</div>'
            + '<div class="glass goal"><div><small>GOAL</small><b>Coffee table</b><span>Top · 4 legs · 1 shelf</span><span class="warn">● 1 cell wasted</span></div>%s</div>' % iso_table()
            + '<div class="dock"><div class="row">%s%s%s%s</div><div class="tools"><button class="gb">%s</button><button class="gb">%s</button><button class="gold cta grow">Cut %s</button></div></div>'
            % (piece([(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1)], 'Shelf', 1, True), piece([(0, 0), (0, 1), (0, 2)], 'Leg', 2), piece([(0, 0), (1, 0), (2, 0), (3, 0)], 'Rail', 1), piece([(0, 0), (1, 0), (1, 1)], 'Brace', 1),
               ic('rotate'), ic('undo'), ic('saw', 20, INK, 2.2)))

# =============== 6 GARDEN ===============
G, gc, gx0, gy0 = 6, 52, 39, 196
gd = ['<rect x="%d" y="%d" width="%d" height="%d" rx="20" fill="#3a2a1c"/>' % (gx0 - 10, gy0 - 10, G * gc + 20, G * gc + 20)]
for r in range(G):
    for c in range(G):
        shade = c >= 3 and r <= 2
        col = '#86b965' if not shade else '#5e8c50'
        if (r + c) % 2:
            col = mix(col, '#000000', .05)
        gd.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>' % (gx0 + c * gc, gy0 + r * gc, gc, gc, col))
gd.append('<rect x="%d" y="%d" width="%d" height="%d" fill="url(#grassTex)" opacity=".7"/>' % (gx0, gy0, G * gc, G * gc))
gd.append('<path d="M%d %d q60 -30 156 20 v136 h-156z" fill="#0e2a1a" opacity=".28" transform="translate(%d %d)"/>' % (0, 0, gx0 + 3 * gc, gy0))
gd.append('<circle cx="%d" cy="%d" r="80" fill="#ffd98a" opacity=".22" filter="url(#b14)"/>' % (gx0 + 40, gy0 + 40))
gd.append('<g transform="translate(%d %d)">%s</g>' % (gx0 + 22, gy0 + 22, '<circle r="11" fill="#ffd36a"/>' + ''.join('<line x1="0" y1="-16" x2="0" y2="-21" stroke="#ffd36a" stroke-width="2.4" stroke-linecap="round" transform="rotate(%d)"/>' % a for a in range(0, 360, 45))))
path_w = [(gx0, gy0 + 3.5 * gc), (gx0 + 2.5 * gc, gy0 + 3.5 * gc), (gx0 + 2.5 * gc, gy0 + 5.5 * gc), (gx0 + 6 * gc, gy0 + 5.5 * gc)]
gd.append('<polyline points="%s" fill="none" stroke="#2f7fb0" stroke-width="16" stroke-linejoin="round"/><polyline points="%s" fill="none" stroke="#6cc2ea" stroke-width="10" stroke-linejoin="round"/><polyline points="%s" fill="none" stroke="#e4f6ff" stroke-width="2" stroke-dasharray="6 10" stroke-linejoin="round"/>' % (P(path_w), P(path_w), P(path_w)))
for c, r in [(0, 0), (1, 0), (1, 1), (1, 2), (2, 2)]:
    x, y = gx0 + c * gc, gy0 + r * gc
    gd.append('<rect x="%d" y="%d" width="%d" height="%d" rx="12" fill="#cdb98f"/><rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="#e3d2a8"/>' % (x + 8, y + 10, gc - 16, gc - 16, x + 8, y + 8, gc - 16, gc - 18))


def gplant(cx, cy, kind):
    if kind == 'sun':
        return ('<circle cx="%d" cy="%d" r="17" fill="#3f7f4a"/>' % (cx, cy + 3) + ''.join('<ellipse cx="%d" cy="%d" rx="5.5" ry="10" fill="#f49ab0" transform="rotate(%d %d %d)"/>' % (cx, cy - 8, a, cx, cy) for a in range(0, 360, 60))
                + '<circle cx="%d" cy="%d" r="5" fill="#ffd36a"/>' % (cx, cy))
    if kind == 'shade':
        return ''.join('<path d="M%d %d q%d -22 %d -26 q-2 14 -%d 26z" fill="%s"/>' % (cx, cy + 12, d, int(d * 1.3), d, c) for d, c in [(-15, '#2f6f45'), (15, '#3f8a55'), (-6, '#4f9f62'), (6, '#68b877')])
    return '<circle cx="%d" cy="%d" r="17" fill="#2f6f45"/><circle cx="%d" cy="%d" r="12" fill="#3f8a55"/><circle cx="%d" cy="%d" r="6" fill="#68b877"/>' % (cx, cy, cx - 3, cy - 3, cx - 6, cy - 6)


for c, r, k in [(4, 1, 'shade'), (5, 2, 'shade'), (0, 4, 'sun'), (3, 4, 'sun'), (4, 3, 'bush')]:
    gd.append(gplant(gx0 + c * gc + gc // 2, gy0 + r * gc + gc // 2, k))
x, y = gx0 + gc, gy0 + 4 * gc
gd.append('<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#e7766a" fill-opacity=".25" stroke="#e7766a" stroke-width="2.5"/>' % (x + 2, y + 2, gc - 4, gc - 4))
gd.append(gplant(x + gc // 2, y + gc // 2 - 4, 'shade'))
garden_scr = (scene(''.join(gd), '<rect width="390" height="844" fill="#101a2b"/>')
              + hud('pause', 'Plant by the Rules', 'GARDEN · PLANNING', '<div class="ring" style="--p:66"><b>2/3</b></div>')
              + '<div class="rules"><i class="ok">%s Sun lovers in sunlight</i><i class="bad">✕ Fern can’t take full sun</i><i class="ok">%s Water reaches every bed</i></div>' % (ic('check', 13, '#6fd39a', 3), ic('check', 13, '#6fd39a', 3))
              + '<div class="dock"><div class="row"><div class="bt"><svg width="44" height="40" viewBox="0 0 54 48">%s</svg><b>Sunflower</b><span>2</span></div><div class="bt sel"><svg width="44" height="40" viewBox="0 0 54 48">%s</svg><b>Fern</b><span>1</span></div><div class="bt"><svg width="44" height="40" viewBox="0 0 54 48">%s</svg><b>Shrub</b><span>1</span></div><div class="bt"><svg width="44" height="40" viewBox="0 0 54 48"><rect x="10" y="12" width="34" height="26" rx="10" fill="#e3d2a8"/></svg><b>Stone</b><span>3</span></div></div><div class="tools"><button class="gb">%s</button><button class="gb">%s</button><button class="gold cta grow">Plant %s</button></div></div>'
              % (gplant(27, 26, 'sun'), gplant(27, 30, 'shade'), gplant(27, 24, 'bush'), ic('undo'), ic('bulb'), ic('sprout', 20, INK, 2.2)))

# =============== 7 WIN ===============
mini_dirty = '<svg viewBox="40 200 310 360" width="150" height="96" preserveAspectRatio="xMidYMid slice">%s%s</svg>' % (DEFS, rug_top(56, 214, 278, 336, 0, 'm1'))
mini_clean = '<svg viewBox="40 200 310 360" width="150" height="96" preserveAspectRatio="xMidYMid slice">%s</svg>' % rug_top(56, 214, 278, 336, 1, 'm2')
win = (scene('<g transform="translate(0 70)">%s</g><rect width="390" height="844" fill="#0b1220" opacity=".72"/>' % room('after')
             + ''.join('<rect x="%.0f" y="%.0f" width="7" height="3.5" rx="1.5" fill="%s" transform="rotate(%d %.0f %.0f)"/>' % (x_, y_, rng.choice([GOLD, '#e7766a', '#6fd39a', '#9b7bff', CREAM]), rng.randint(0, 180), x_, y_) for x_, y_ in [(rng.uniform(20, 370), rng.uniform(90, 170)) for _ in range(30)]),
             '<rect width="390" height="844" fill="#1a1724"/>')
       + '<div class="win"><div class="ws">%s<span>%s</span>%s</div><small>TASK COMPLETE</small><h2>Good as new</h2><p>Three stains, zero colour bleed.</p>'
         '<div class="ba"><div>%s<span>Before</span></div><div>%s<span>After</span></div></div>'
         '<div class="rw"><div>%s<b>+60</b></div><div>%s<b>+3</b></div></div>'
         '<button class="gold cta in">Continue</button><button class="text-btn">%s Double coins · optional ad</button></div>' % (star(52), star(70), star(52), mini_dirty, mini_clean, coin(22), star(20), ic('film', 16, GOLD)))

# =============== 8 MAP (house cross-section) ===============
ROOMS = [  # x, y, w, h, name, icon, state
    (78, 238, 234, 70, 'Attic', 'key', 'lock'),
    (78, 316, 112, 92, 'Library', 'book', 'lock'), (198, 316, 114, 92, 'Workshop', 'saw', 'lock'),
    (78, 416, 112, 96, 'Living Room', 'sponge', 'cur'), (198, 416, 114, 96, 'Kitchen', 'wrench', 'lock'),
    (78, 520, 234, 44, 'Entrance', 'home', 'done'),
]
mp = ['<rect width="390" height="844" fill="#101a2b"/>', '<rect y="560" width="390" height="284" fill="#16233a"/>']
mp.append('<path d="M60 230 L195 150 L330 230 Z" fill="#2a3a58" stroke="rgba(243,201,105,.35)" stroke-width="1.5"/>')
mp.append('<rect x="66" y="230" width="258" height="340" rx="6" fill="#1a2740" stroke="rgba(243,201,105,.35)" stroke-width="1.5"/>')
for x, y, w, h, nm, icn, st in ROOMS:
    fill = {'done': '#3b4f3e', 'cur': '#4a3a2a', 'lock': '#1f2b44'}[st]
    mp.append('<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="%s" stroke="%s" stroke-width="%s"/>' % (x, y, w, h, fill, GOLD if st == 'cur' else 'rgba(255,255,255,.08)', 2.5 if st == 'cur' else 1))
    if st != 'lock':
        mp.append('<rect x="%d" y="%d" width="%d" height="%d" rx="10" fill="url(#winGlow)" opacity="%s" style="mix-blend-mode:screen"/>' % (x, y, w, h, .5 if st == 'cur' else .25))
mp.append('<rect x="18" y="470" width="44" height="100" rx="8" fill="#1f2b44" stroke="rgba(255,255,255,.08)"/>')
mp.append('<rect x="328" y="470" width="46" height="100" rx="8" fill="#1f2b44" stroke="rgba(255,255,255,.08)"/>')
mp.append('<rect x="40" y="586" width="310" height="70" rx="14" fill="#2c4a33" stroke="rgba(255,255,255,.08)"/>')
mp.append('<path d="M346 120 l6 -44 h12 l6 44z" fill="#2a3a58" stroke="rgba(243,201,105,.35)"/><rect x="351" y="62" width="14" height="12" rx="2" fill="#3a4658"/>')
labels = ''.join('<div class="rm %s" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx">%s<b>%s</b>%s</div>' % (st, x, y, w, h, ic(icn, 18, GOLD if st != 'lock' else '#56627a'), nm,
                 '<em>62%</em>' if st == 'cur' else ('<em class="ok">%s</em>' % ic('check', 12, INK, 3) if st == 'done' else '')) for x, y, w, h, nm, icn, st in ROOMS)
labels += '<div class="rm lock" style="left:18px;top:470px;width:44px;height:100px;flex-direction:column">%s<b class="v">Garage</b></div>' % ic('lock', 14, '#56627a')
labels += '<div class="rm lock" style="left:328px;top:470px;width:46px;height:100px;flex-direction:column">%s<b class="v">Pool</b></div>' % ic('lock', 14, '#56627a')
labels += '<div class="rm lock" style="left:40px;top:586px;width:310px;height:70px">%s<b>Garden</b><em class="soon">Area 6</em></div>' % ic('sprout', 18, '#56627a')
labels += '<div class="rm lock" style="left:332px;top:128px;width:52px;height:24px;font-size:10px"><b>Lighthouse</b></div>'
map_scr = (scene(''.join(mp), '')
           + hud('back', 'The House', 'MAP · 1 OF 10 AREAS', '<div class="chip">%s<b>38</b></div>' % star(17)) + labels
           + '<div class="glass secret"><div>%s</div><div><b>House secrets</b><small>Blueprint 1 of 6 · next clue in the Library</small></div><div class="p6"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div></div>' % ic('key', 20, GOLD)
           + tabs('Map'))

# =============== 9 SHOP ===============
def toolset(c1, c2):
    return ('<svg width="64" height="46" viewBox="0 0 64 46"><path d="M18 14v-5a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v5" fill="none" stroke="%s" stroke-width="3"/><rect x="4" y="14" width="56" height="28" rx="6" fill="%s"/><rect x="4" y="14" width="56" height="8" rx="4" fill="%s"/><rect x="27" y="20" width="10" height="7" rx="2" fill="%s"/></svg>' % (c2, c1, mix(c1, '#ffffff', .25), GOLD))


coins_html = ''.join('<div class="cp">%s<b>%s</b>%s<button class="price">%s</button></div>' % (coin(24 + i * 3), a, ('<em>%s</em>' % bo) if bo else '', pr) for i, (a, bo, pr) in enumerate([('500', '', '$0.49'), ('1,200', '', '$0.99'), ('3,500', '+15%', '$2.99'), ('10,000', '+40%', '$5.99')]))
shop = (scene('', '<rect width="390" height="844" fill="#101a2b"/><circle cx="320" cy="120" r="180" fill="#2a3b66" opacity=".6" filter="url(#b14)"/>')
        + hud('back', 'Shop', 'NO LOOT BOXES · EVER', '<div class="chip">%s<b>2,450</b></div>' % coin())
        + '<div class="shop"><div class="starter"><div><em>ONE-TIME</em><b>Starter Pack</b><small>1,000 coins · 5 hints · Copper tools</small></div><button class="gold price big">$0.99</button></div>'
        + '<h4>Tool sets</h4><div class="g3"><div class="it">%s<b>Classic</b><span class="own">Equipped</span></div><div class="it">%s<b>Copper</b><button class="price">$0.99</button></div><div class="it">%s<b>Walnut</b><button class="price">$1.49</button></div></div>' % (toolset('#b5473a', '#7a2a20'), toolset('#c98f4a', '#7a5020'), toolset('#7a4d2a', '#4a2a10'))
        + '<h4>Decor styles</h4><div class="g3"><div class="it"><i class="sw" style="--c:#36817a"></i><b>Coastal</b><span class="own">Free</span></div><div class="it"><i class="sw" style="--c:#a8693a"></i><b>Classic</b><button class="price">$1.49</button></div><div class="it"><i class="sw" style="--c:#59606b"></i><b>Modern</b><button class="price">$1.49</button></div></div>'
        + '<h4>Coins</h4><div class="g4">%s</div>' % coins_html
        + '<div class="g2"><div class="it"><b>Remove ads</b><small>Forever · rewards stay</small><button class="price">$2.99</button></div><div class="it"><b>50 free coins</b><small>Short optional ad</small><button class="price ghostp">%s Watch</button></div></div></div>' % ic('film', 14, GOLD))

SCREENS = [('Home', home), ('Room · Before', before), ('Room · After', after), ('Puzzle · Stain Chemistry', rug_scr), ('Puzzle · Plan the Cut', wood_scr),
           ('Puzzle · Plant by the Rules', garden_scr), ('Task Complete', win), ('House Map', map_scr), ('Shop', shop)]
CSS = open('/home/user/oya-agent-agent/design/house-game-v3/fonts/fonts.css').read() + open('/home/user/oya-agent-agent/design/house-game-v3/style.css').read()
html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><style>%s</style></head><body>%s</body></html>' % (
    CSS, ''.join('<div class="ph" id="s%d"><div class="cap">%s</div><div class="scr">%s</div></div>' % (i + 1, t, b) for i, (t, b) in enumerate(SCREENS)))
open(OUT, 'w').write(html)
print('ok', len(SCREENS))
