"""Sound design for «أمك لن تبقى للأبد» (no music): room tone, phone vibration,
clock ticks, pages, heartbeats, door, wind, dawn birds — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 70.0
N = int(SR * DUR); t = np.arange(N) / SR
rng = np.random.default_rng(11)
def noise(n=N): return rng.standard_normal(n)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(pts): ts, gs = zip(*pts); return np.interp(t, ts, gs)
L = np.zeros(N); Rt = np.zeros(N)
def put(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i + n] += sig[:n] * gain * np.sqrt((1 - pan) / 2) * 1.414; Rt[i:i + n] += sig[:n] * gain * np.sqrt((1 + pan) / 2) * 1.414
def bed(sig, pan=0.0): put(sig, 0, 1, pan)

# room tone & soft low drone of air
bed(lp(noise(), 120) * .5 * env([(0, 0), (1, .6), (20, .5), (29, .4), (55, .5), (63, .4), (70, 0)]))
bed(bp(noise(), 300, 1500) * .02 * env([(0, 1), (70, 1)]), -.2)

# phone vibration (scene 1 and scene 7)
def buzz(dur):
    k = np.arange(int(dur * SR)) / SR
    s = np.sign(np.sin(2 * np.pi * 150 * k)) * .5 + np.sin(2 * np.pi * 300 * k) * .3
    gate = (np.sin(2 * np.pi * 1.2 * k) > -.2).astype(float)
    return lp(s * gate, 900) * .35
put(buzz(3.4), .7); put(buzz(1.6), 63.4)
# answer chime (soft sine bell — not music, a UI tone)
k = np.arange(int(2.5 * SR)) / SR
chime = (np.sin(2 * np.pi * 880 * k) + .5 * np.sin(2 * np.pi * 1320 * k)) * np.exp(-k * 2.5) * .25
put(chime, 65.0, 1, .1)

# clock ticks accelerating (scene 2: 6–13.5)
tick = hp(rng.standard_normal(int(.03 * SR)), 2500) * np.exp(-np.arange(int(.03 * SR)) / 150)
tt = 6.3; p = 0.0
while tt < 13.2:
    put(tick, tt, .5 + .3 * ((tt - 6) / 7), .3 if p % 2 else -.3); p += 1
    tt += max(.06, .55 * (1 - (tt - 6) / 8) ** 2)
# paper flutter
for i in range(18):
    n = int(.4 * SR); s = bp(rng.standard_normal(n), 1500, 6000) * np.hanning(n) * .25
    put(s, 7 + i * .32, 1, (-1) ** i * .5)
# candle crackle
cr = np.zeros(N)
for _ in range(500):
    i = rng.integers(int(6 * SR), int(13.5 * SR)); m = 160; cr[i:i + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / 20) * rng.uniform(.1, .6)
bed(hp(cr, 2000) * .5)

# heartbeat thumps at the hadith (scene 4)
def thump():
    n = int(.5 * SR); k = np.arange(n) / SR
    s = np.sin(2 * np.pi * 55 * k) * np.exp(-k * 9) + .6 * np.sin(2 * np.pi * 50 * (k - .16)) * np.exp(-np.clip(k - .16, 0, None) * 10) * (k > .16)
    return s
for b, g in ((22.6, .9), (23.6, .9), (24.6, .9), (25.8, .6)): put(thump(), b, g)

# gentle whooshes on transitions
def whoosh(dur=1.2):
    n = int(dur * SR); s = rng.standard_normal(n); out = np.zeros(n); seg = n // 10
    for j in range(10):
        f = 400 + j * 250; a, b = j * seg, min(n, (j + 2) * seg); out[a:b] += bp(s[a:b], f * .7, f * 1.3) * np.hanning(b - a)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2 * .3
for b in (6, 13, 20, 29, 55, 63): put(whoosh(), b - .4, 1, -.2)
# step transitions: small sparkle
for i in range(5):
    n = int(.8 * SR); put(hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / (SR * .2)) * .15, 32.2 + i * 4.4, 1, .3)
# door creak (step 4)
n = int(1.6 * SR); k = np.arange(n) / SR
creak = bp(np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 3 * k)) * k) * (1 + .5 * rng.standard_normal(n)), 150, 1200) * np.hanning(n) * .2
put(creak, 45.5, 1, .2)
# wind at the empty chair (scene 6)
bed(bp(noise(), 200, 800) * .25 * env([(0, 0), (55, 0), (56.5, 1), (62.5, 1), (63.5, 0), (70, 0)]), .3)
# dawn birds (scene 7)
for i in range(14):
    at = 64.5 + rng.uniform(0, 4.5); n = int(.18 * SR); k = np.arange(n) / SR
    f0 = rng.uniform(2800, 4200); s = np.sin(2 * np.pi * (f0 + 900 * np.sin(2 * np.pi * 14 * k)) * k) * np.hanning(n) * .06
    put(s, at, 1, rng.uniform(-.7, .7))

def verb(x):
    y = x.copy()
    for d, g in ((1931, .3), (2593, .25), (3511, .2), (4799, .15)): y[d:] += x[:-d] * g
    return lp(y, 8000)
L, Rt = verb(L), verb(np.roll(Rt, 150))
mx = np.stack([L, Rt], 1) * np.clip(np.minimum(t / .8, (DUR - t) / 1.2), 0, 1)[:, None]
mx = np.tanh(mx / np.percentile(np.abs(mx), 99.9) * .8) * .8
with wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'soundtrack.wav'), 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mx * 32767).astype(np.int16).tobytes())
print('soundtrack.wav written')
