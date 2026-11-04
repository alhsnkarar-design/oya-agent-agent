"""Sound design for «المفلس الحقيقي» (no music): footsteps, bricks, trowel, heat, office,
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

# --- ambience beds
bed(lp(noise(), 150) * .3 * env([(0, 0), (1, 1), (33, 1), (34, .6), (46, .9), (56, .4), (64, .2), (84, .1)]))           # room / low bed
bed(lp(noise(), 70) * .7 * env([(0, 0), (34, 0), (35.5, 1), (45, 1), (51, 1.4), (55.5, 1.6), (56.3, 0), (84, 0)]))     # judgment drone & rumble
bed(bp(noise(), 200, 900) * .04 * env([(0, 0), (64, 0), (65, 1), (84, 1)]), -.3)                                     # outdoor air
for i in range(14):
    at = 64.5 + rng.uniform(0, 18); n = int(.16 * SR); k = np.arange(n) / SR
    f0 = rng.uniform(2800, 4300); put(np.sin(2 * np.pi * (f0 + 800 * np.sin(2 * np.pi * 15 * k)) * k) * np.hanning(n) * .045, at, 1, rng.uniform(-.7, .7))
# --- scene events
put(chime(660, 2.5), .8, .7); put(squeak(.8), 6.3, 1, .2); put(whoosh(.8), 7.0, 1, .1)                               # 1 wallet
n = int(1.8 * SR); put(bp(rng.standard_normal(n), 120, 400) * (np.abs(np.sin(2 * np.pi * 18 * np.arange(n) / SR)) ) * np.hanning(n) * .25, 8.2, 1, .3)  # moth wings
for k, t0 in enumerate((13.6, 15.4, 17.2)): put(sparkle(), t0, 1, (k - 1) * .5)                                      # 2 worship → light
for i in range(15): put(chime(880 * 2 ** ((i % 5) / 12 * 2), .9), 14.2 + i * .4, .35, (i % 3 - 1) * .4)
n = int(.5 * SR); put(bp(rng.standard_normal(n), 300, 2500) * dec(n, .12) * .9, 22.4, 1, .2)                          # 3 insult burst
put(boom(70, 1.5), 24.8, .5)                                                                                          #   slander rumble
put(paper(.5), 27.4, 1, -.2)                                                                                          #   money taken
put(splash() * .6, 31.0, 1)                                                                                           #   the drop
put(thud(), 31.9, 1.2, .3)                                                                                            #   the shove
for i in range(5):                                                                                                    # 4 good deeds taken
    for q in range(3): put(whoosh(.7), 34 + 1.5 + i * 2.2 + q * .45, .8, (-1) ** i * .5)
put(boom(40, 4), 34.2, .8)
for i in range(8): put(thud(), 46.5 + i * .6 + .35, .9, (i % 3 - 1) * .3)                                            # 5 sins cast
put(boom(35, 5), 52, 1.0)
put(paper(.7), 56.3, 1); put(chime(523, 3), 56.6, .5)                                                                 # 6 the book
footsteps(64.3, 66, .6, pan=-.3); put(paper(.5), 66.4, 1); put(chime(784, 2.5), 68.6, .7)                            # 7 returning the right
for i in range(15): put(chime(1046, .7), 68.5 + i * .3, .2, (i % 3 - 1) * .4)
put(sparkle(), 71.7, 1); footsteps(74, 79, .6, .7)                                                                   # 8 together
put(chime(784, 3), 79, .9); put(chime(1175, 3), 79.05, .5); put(boom(50, 2.5), 79, .4)
for b in (11.8, 21.8, 33.8, 45.8, 55.8, 63.8, 73.8): put(whoosh(), b - .2, 1, -.2)

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
