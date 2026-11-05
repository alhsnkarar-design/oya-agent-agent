"""Sound design for «البطاقة» (no music): footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 73.0
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
bed(lp(noise(), 140) * .28 * env([(0, 0), (.5, 1), (73, .4)]))
bed(bp(noise(), 300, 1400) * .02 * env([(0, 0), (5, 0), (6, 1), (11.5, 1), (12, 0), (73, 0)]))          # the multitude
bed(lp(noise(), 70) * .5 * env([(0, 0), (20, 0), (21, .8), (27, .8), (27.5, 0), (48, 0), (50, .8), (56, .8), (56.5, 0), (73, 0)]))
# --- events
for i in range(9): put(paper(.25), 1.4 + i * .18, .5, -.4)
put(chime(523, 2.5), 6.2, .45); put(chime(784, 2.5), 13.0, .35)
for i in range(40): put(tick(), 12.6 + (i / 40) ** .8 * 5.2, .35, (i % 2 - .5) * .4)    # counting the records
put(boom(55, 1.6), 23.2, .5); put(boom(55, 1.6), 25.4, .5)                              # «لا… لا»
put(sparkle(), 28.0, .8); put(chime(1046, 2.5), 30.4, .6)                                 # the single good deed
put(chime(784, 3), 34.6, .6); put(chime(1175, 3), 34.65, .35); put(sparkle(), 34.7, 1)     # the card
for i in range(30): put(tick(), 41.4 + i * .1, .2)
put(squeak(1.6) * 1.4, 51.6, 1, -.1); put(boom(45, 3), 53.2, 1.0); put(whoosh(1.6), 52.4, 1, -.3)   # the balance turns
put(chime(784, 3.5), 56.3, .8); put(chime(1175, 3.5), 56.35, .45); put(sparkle(), 56.4, 1)
for i in range(4): put(boom(60, .5), 63 + i * .9, .35); put(boom(60, .4), 63.25 + i * .9, .25)   # heartbeat
put(chime(784, 3), 68.8, .7); put(chime(1175, 3), 68.85, .4)
for b in (5, 12, 20, 27, 34, 41, 48, 56, 62, 68): put(whoosh(.8), b - .3, .45, -.2)

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
