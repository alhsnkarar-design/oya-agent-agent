"""Sound design for «المفلس الحقيقي» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 90.0
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
bed(lp(noise(), 150) * .3 * env([(0, 0), (1, 1), (8, .6), (38, .8), (50, .9), (60, .4), (90, .1)]))
bed(bp(noise(), 300, 1200) * .03 * env([(0, 0), (8, 0), (8.5, 1), (12.3, 1), (12.6, 0), (90, 0)]))                       # mosque air
bed(bp(noise(), 200, 900) * .04 * env([(0, 0), (12.5, 0), (13, 1), (16.8, 1), (17.2, 0), (90, 0)]), .3)                   # sunset breeze
bed(bp(noise(), 400, 2500) * .035 * env([(0, 0), (17, 0), (17.5, 1), (37.6, 1), (38, 0), (66.8, 0), (67.4, 1), (80, 1), (80.4, 0), (90, 0)]), -.2)  # street murmur
bed(lp(noise(), 70) * .7 * env([(0, 0), (38, 0), (39.5, 1), (49.5, 1), (55, 1.4), (59.5, 1.6), (60.3, 0), (90, 0)]))      # judgment drone
for i in range(24):
    at = rng.choice([rng.uniform(17.5, 37), rng.uniform(67.5, 89)]); n = int(.16 * SR); k = np.arange(n) / SR
    f0 = rng.uniform(2800, 4300); put(np.sin(2 * np.pi * (f0 + 800 * np.sin(2 * np.pi * 15 * k)) * k) * np.hanning(n) * .04, at, 1, rng.uniform(-.7, .7))
# --- events
put(chime(660, 2.5), .7, .7); put(squeak(.8), 4.3, 1, .2); put(whoosh(.8), 5.0, 1, .1)
n = int(1.8 * SR); put(bp(rng.standard_normal(n), 120, 400) * np.abs(np.sin(2 * np.pi * 18 * np.arange(n) / SR)) * np.hanning(n) * .25, 5.6, 1, .3)
for t0 in (9.6, 14.1, 18.6):
    for j in range(4): put(chime(880 * 2 ** (j * 2 / 12), .9), t0 + j * .45, .35, (j - 1.5) * .3)
put(paper(.3), 19.0, 1, .2)
n = int(.5 * SR); put(bp(rng.standard_normal(n), 300, 2500) * dec(n, .12) * .9, 22.6, 1, .2)                         # insult
put(boom(80, 1.2), 26.2, .4)                                                                                      # slander
put(paper(.5), 28.8, 1, .2); footsteps(29.6, 31.4, .5, .8, -.4)                                                  # takes goods
put(splash() * .6, 33.3, 1)                                                                                       # drop
put(thud(), 35.2, 1.2, .3); put(thud(), 35.9, .9, .4)                                                            # shove + sack falls
for i in range(4):
    for q in range(3): put(whoosh(.7), 38 + .8 + i * 2.6 + .5 + q * .45, .8, (-1) ** i * .5)
put(boom(40, 4), 38.3, .8)
for i in range(8): put(thud(), 50.3 + .5 + i * .6 + .4, .9, (i % 3 - 1) * .3)
put(boom(35, 5), 56, 1.0)
put(paper(.7), 60.3, 1); put(chime(523, 3), 60.6, .5)
for i in range(4):
    put(chime(784, 2), 67 + i * 3.2 + 1.6, .55, (i % 2 - .5)); put(sparkle(), 67 + i * 3.2 + 1.7, 1)
put(chime(784, 3), 84.6, .9); put(chime(1175, 3), 84.65, .5); put(boom(50, 2.5), 84.6, .4)
for b in (7.8, 12.3, 16.8, 21.8, 37.8, 49.8, 59.8, 66.8, 79.8): put(whoosh(), b - .2, 1, -.2)

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
