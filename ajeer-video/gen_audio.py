"""Sound design for «أعطِ الأجير أجره» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 80.0
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

# --- ambience beds
bed(bp(noise(), 200, 900) * .05 * env([(0, 0), (.8, 1), (16, 1), (16.5, 0), (80, 0)]), -.3)        # outdoor wind
bed(hp(noise(), 3500) * .015 * (1 + np.sin(2 * np.pi * 7 * t)) * env([(0, 0), (7, 0), (8, 1), (16, 1), (16.5, 0), (80, 0)]), .4)  # noon heat buzz
bed(lp(noise(), 160) * .25 * env([(0, 0), (16, 0), (16.6, 1), (26, 1), (26.5, 0), (45, 0), (45.5, 1), (53, 1), (53.5, 0), (80, 0)]))  # office room tone
cr = np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 28 * t) > .6) * (np.sin(2 * np.pi * .8 * t) > 0)
bed(cr * .01 * env([(0, 0), (26, 0), (27, 1), (35, 1), (35.5, 0), (80, 0)]), .6)                    # night crickets
bed(lp(noise(), 80) * .5 * env([(0, 0), (35, 0), (36.5, 1), (44.5, 1), (45.5, 0), (80, 0)]))          # deep drone at the scale
for i in range(16):                                                                                  # dawn & ending birds
    for base, span in ((.5, 6), (74, 4)):
        at = base + rng.uniform(0, span); n = int(.16 * SR); k = np.arange(n) / SR
        f0 = rng.uniform(2800, 4300); put(np.sin(2 * np.pi * (f0 + 800 * np.sin(2 * np.pi * 15 * k)) * k) * np.hanning(n) * .05, at, 1, rng.uniform(-.7, .7))

# --- scene events
footsteps(.4, 5.3, pan=.3); put(thud(), 5.8, 1, -.2)                                                # 1 dawn
for k in range(12): put(thud(), 7.6 + k * .62, .55, -.3); put(scrape(.35), 7.8 + k * .62, 1, -.3)   # 2 bricks & trowel
put(splash(), 15.8, 1, -.1); put(chime(1320, 1.5), 15.8, .6)                                         #   the sweat drop lands
footsteps(16.3, 18.5, .7, pan=-.3); put(squeak(), 19.2, 1, .3); put(squeak(), 22.2, 1, .3)          # 3 office
for ft in (21.2, 22.7, 24.2): put(paper(.5), ft, 1, -.4)
put(chime(660, 1.8), 20.6, .5, .2)
footsteps(26.2, 28.4, .75, .8, pan=.4)                                                               # 4 home
for k in range(10): put(tick(), 29 + k * 1.0, .4, -.5)
fl = (np.sin(2 * np.pi * 120 * t) * .02) * env([(0, 0), (33, 0), (33.3, 1), (34.6, 1), (35, 0), (80, 0)]); bed(fl)
put(boom(40, 4), 35.4, .9); put(squeak(2.4) * 1.5, 38.2, 1, -.2)                                     # 5 scale
put(boom(55, 3), 40.6, .6)
footsteps(45.3, 46.9, .65, pan=.2); put(paper(.6), 47.2, 1, .1); put(chime(990, 2.4), 48.2, .8); put(sparkle(), 48.3, 1)  # 6 paid
for k in range(5): put(sparkle(), 53 + k * 3.4, 1, .2)                                                # 7 steps
for k in range(6): put(tick(), 53.1 + k * .27, .6)
put(chime(1180, 1.6), 54.6, .6)
for k in range(10): put(scrape(.15) * .8, 61.4 + k * .14, 1, .1)
put(thud(), 62.4, .8); footsteps(63.3, 66.5, .57, .8); put(thud(), 67.3, .7, .3); put(sparkle(), 68.2, 1)
put(chime(784, 3), 77.2, .9); put(chime(1175, 3), 77.25, .5); put(boom(50, 2.5), 77.2, .4)          # 8 ending
for b in (7, 16, 26, 35, 45, 53, 70): put(whoosh(), b - .35, 1, -.2)

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
