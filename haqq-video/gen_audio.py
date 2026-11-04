"""Sound design for «أكل أموال الناس بالباطل» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 84.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(23)
def noise(n=N): return rng.standard_normal(n)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(pts): ts, gs = zip(*pts); return np.interp(t, ts, gs)
L = np.zeros(N); Rt = np.zeros(N)
def put(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    L[i:i + n] += sig[:n] * gain * np.sqrt((1 - pan) / 2) * 1.414; Rt[i:i + n] += sig[:n] * gain * np.sqrt((1 + pan) / 2) * 1.414
def bed(sig, pan=0.0): put(sig, 0, 1, pan)
def dec(n, tau): return np.exp(-np.arange(n) / (tau * SR))

# --- one-shot generators
def step(g=1.0): n = int(.12 * SR); return lp(rng.standard_normal(n), 900) * dec(n, .02) * .5 * g
def thud(): n = int(.35 * SR); k = np.arange(n) / SR; return (np.sin(2 * np.pi * 90 * k) * dec(n, .05) + lp(rng.standard_normal(n), 600) * dec(n, .03) * .6) * .6
def scrape(d=.5): n = int(d * SR); return bp(rng.standard_normal(n), 1500, 5000) * np.hanning(n) * .12
def paper(d=.4): n = int(d * SR); return bp(rng.standard_normal(n), 2000, 7000) * np.hanning(n) * .18
def squeak(d=.7):
    n = int(d * SR); k = np.arange(n) / SR; f = 700 + 300 * np.sin(2 * np.pi * 2.5 * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(n) * .05
def chime(f=880, d=2.5): n = int(d * SR); k = np.arange(n) / SR; return (np.sin(2 * np.pi * f * k) + .5 * np.sin(2 * np.pi * f * 1.5 * k) + .25 * np.sin(2 * np.pi * f * 2.01 * k)) * dec(n, .5) * .16
def sparkle(): n = int(.9 * SR); return hp(rng.standard_normal(n), 7000) * dec(n, .18) * .14
def boom(f=45, d=3.5): n = int(d * SR); k = np.arange(n) / SR; return (np.sin(2 * np.pi * f * k * np.exp(-k * .5)) * dec(n, .7) + lp(rng.standard_normal(n), 120) * dec(n, .4)) * .5
def splash(): n = int(.6 * SR); return bp(rng.standard_normal(n), 800, 6000) * dec(n, .08) * .35
def whoosh(d=1.0):
    n = int(d * SR); s = rng.standard_normal(n); out = np.zeros(n); seg = n // 10
    for j in range(10):
        f = 400 + j * 260; a, b = j * seg, min(n, (j + 2) * seg); out[a:b] += bp(s[a:b], f * .7, f * 1.3) * np.hanning(b - a)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * .22
def tick(): n = int(.03 * SR); return hp(rng.standard_normal(n), 2500) * dec(n, .003) * .5
def footsteps(a, b, period=.57, g=1.0, pan=0.0):
    x = a
    while x < b: put(step(g), x, 1, pan); x += period

# --- ambience
bed(lp(noise(), 150) * .3 * env([(0, 0), (1, 1), (24, .7), (58, .9), (84, .2)]))
bed(bp(noise(), 200, 900) * .05 * env([(0, 0), (5.8, 0), (6.5, 1), (13.5, 1), (14, 0), (84, 0)]), .3)                       # open air at Arafat
bed(bp(noise(), 300, 1400) * .03 * env([(0, 0), (6, 0), (7, 1), (13.5, 1), (14, 0), (84, 0)]), -.3)                       # crowd murmur
cr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > .6) * (np.sin(2 * np.pi * .8 * t) > 0)
bed(cr * .01 * env([(0, 0), (14, 0), (14.5, 1), (19.5, 1), (20, 0), (84, 0)]), .6)                                            # night crickets
bed(bp(noise(), 400, 2500) * .03 * env([(0, 0), (33, 0), (33.5, 1), (44.5, 1), (45, 0), (68, 0), (68.5, 1), (77.5, 1), (78, 0), (84, 0)]), -.2)  # street
bed(lp(noise(), 70) * .6 * env([(0, 0), (19, 0), (21, 1), (23.5, 0), (45, 0), (46, .6), (57.5, .6), (58, 1), (67.5, 1), (68, 0), (84, 0)]))  # drones
# --- events
for i in range(26): put(chime(rng.uniform(1800, 3200), .35), .3 + i * .1 + rng.uniform(0, .05), .12, rng.uniform(-.6, .6))     # coins pouring
put(chime(660, 2.5), 2.6, .6)
put(thud(), 16.3, .9, .2); put(scrape(.6), 16.5, 1, .2); put(boom(40, 4), 19.4, .8)                                       # stake moved, earths encircle
put(squeak(), 26.0, 1, .3); put(squeak(), 29.2, 1, .3)
for ft in (27.0, 28.6, 30.2): put(paper(.5), ft, 1, -.4)
footsteps(23.9, 25.5, .7, .8, -.3)
put(chime(1320, .5), 33.6, .3); put(chime(1046, 2), 37.4, .6); put(sparkle(), 37.5, 1)                                   # honest repayment
n = int(2 * SR); put(bp(rng.standard_normal(n), 500, 3000) * np.hanning(n) * .25, 41.5, 1, .3)                            # money crumbling
put(boom(55, 2), 46.4, .8); put(paper(.6), 48.8, 1, -.2); footsteps(50.2, 53, .6, .8, -.4)                                 # false oath
put(chime(1568, 2), 52.6, .6); put(sparkle(), 52.7, 1)                                                                     # «وإن قضيبًا من أراك»
put(boom(40, 4), 58.2, .8)
for i in range(3):
    for q in range(5): put(chime(rng.uniform(1800, 2600), .4), 58 + 2.6 + i * 1.6 + q * .2 + .6, .18, (-1) ** i * .5)
for i in range(4): put(chime(784, 2), 68 + i * 2.5 + 1.4, .55, (i % 2 - .5)); put(sparkle(), 68 + i * 2.5 + 1.5, 1)
put(chime(784, 3), 78.4, .9); put(chime(1175, 3), 78.45, .5); put(boom(50, 2.5), 78.4, .4)
for b in (5.8, 13.8, 23.8, 32.8, 44.8, 57.8, 67.8, 77.8): put(whoosh(), b - .2, 1, -.2)

def verb(x):
    y = x.copy()
    for d, g in ((1931, .28), (2593, .22), (3511, .18), (4799, .12)): y[d:] += x[:-d] * g
    return lp(y, 9000)
L, Rt = verb(L), verb(np.roll(Rt, 150))
mx = np.stack([L, Rt], 1) * np.clip(np.minimum(t / .8, (DUR - t) / 1.2), 0, 1)[:, None]
mx = np.tanh(mx / np.percentile(np.abs(mx), 99.9) * .8) * .8
with wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'soundtrack.wav'), 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mx * 32767).astype(np.int16).tobytes())
print('soundtrack.wav written')
