"""Sound design for «صلاتك في وقتها» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 41.0
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

# --- calm ambience (no music)
bed(lp(noise(), 140) * .26 * env([(0, 0), (.4, 1), (41, .4)]))
# --- events
for i in range(24): put(tick(), .3 + i * .07, .3, (i % 2 - .5) * .3)                       # the dial is drawn
put(chime(660, 2.5), 4.9, .45)                                                                # «؟»
for i in range(5): put(chime(784 * 2 ** (i * 2 / 12), 1.2), 8.9 + i * .45, .4, (i - 2) * .25)   # five prayers appear
put(chime(1046, 2), 11.4, .4)
put(sparkle(), 14.6, .8); put(chime(1318, 2), 15.4, .4)                                       # the tiny slice
put(whoosh(2.4), 18.8, .5, .2)                                                                 # postponed
put(boom(60, 1.6), 23.0, .45); n = int(1.2 * SR); put(bp(rng.standard_normal(n), 400, 2000) * np.hanning(n) * .12, 24.3, 1)   # missed
for i in range(4): put(chime(523, 1.6), 27.5 + i * .9, .25, -.5)                                # call to prayer (soft tones, not music)
put(thud(), 28.6, .5, .3); put(chime(784, 2), 29.0, .4)                                        # he gets up
put(whoosh(2), 32, .5); for_ = None
for i in range(5): put(chime(1046, .6), 32.9 + i * .18, .25, (i - 2) * .3)                     # the bars align
for i in range(4): put(boom(60, .5), 36.6 + i * .9, .3); put(boom(60, .4), 36.85 + i * .9, .2)   # a calm heartbeat
put(chime(784, 3), 38.4, .7); put(chime(1175, 3), 38.45, .4)
for b in (4.5, 8.5, 13.5, 18, 22.5, 26.5, 31.5, 36): put(whoosh(.7), b - .25, .4, -.2)

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
