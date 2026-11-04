"""Sound design for «الثلاثة أول من يُقضى عليهم» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 96.0
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
bed(lp(noise(), 150) * .3 * env([(0, 0), (1, 1), (96, .3)]))
bed(lp(noise(), 70) * .6 * env([(0, 0), (18, 0), (19, 1), (32.5, 1), (33, 0), (40, 0), (41, 1), (54.5, 1), (55, 0), (62, 0), (63, 1), (76.5, 1), (77, 0), (96, 0)]))   # judgment drone
for P in (11, 33, 55):
    bed(bp(noise(), 400, 3000) * .06 * env([(0, 0), (P + 2.4, 0), (P + 3, 1), (P + 7.6, 1), (P + 8, 0), (96, 0)]), -.2)        # crowd roar / applause
    bed(bp(noise(), 300, 1500) * .05 * env([(0, 0), (P + 15.3, 0), (P + 15.8, 1), (P + 18.6, .6), (P + 19.4, 0), (96, 0)]), .3)  # echo of praise
    put(chime(523, 3), P + 8.2, .5); put(sparkle(), P + 9.2, .8)                     # brought before the light
    put(boom(60, 1.8), P + 15.2, .7)                                                    # «كذبتَ»
    n = int(1.4 * SR); put(bp(rng.standard_normal(n), 500, 3000) * np.hanning(n) * .3, P + 16.2, 1, .2)   # the deed cracks to dust
    put(boom(35, 3.5), P + 19.6, .9)                                                    # the fall
for i in range(14): put(thud(), 11 + .4 + i * .52, .35, (i % 2 - .5))                    # battle drums
for i in range(12): put(chime(rng.uniform(1800, 2800), .3), 55 + 1 + i * .12, .12, rng.uniform(-.5, .5))   # coins
for t0 in (56.6, 58.1, 60.3, 61.6): put(chime(2400, .2), t0, .2, .6)                     # phone shutters
for i in range(3): put(chime(784, 2), .3 + i * .5, .35, (i - 1) * .4)
put(sparkle(), 4.6, .8); put(chime(660, 2.5), 6.4, .5)
put(chime(523, 4), 77.4, .6); put(boom(45, 2.5), 81.6, .4)
footsteps(86, 88, .6, .6, .3); put(paper(.4), 88.4, 1); footsteps(89.4, 92, .55, .6, -.3)
put(chime(784, 3), 92.8, .8); put(chime(1175, 3), 92.85, .45)
for b in (10.8, 18.9, 32.8, 40.9, 54.8, 62.9, 76.8, 85.8): put(whoosh(), b, .9, -.2)

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
