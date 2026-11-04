"""Voice-synced mix for «المفلس الحقيقي»: the uploaded recitation + quiet sound design: footsteps, bricks, trowel, heat, office,
chair squeaks, calendar pages, night crickets, scale creak, chimes — synced to index.html."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 45.2
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

# --- ambience (kept low: the recited voice leads)
bed(lp(noise(), 150) * .25 * env([(0, 0), (1, 1), (10, .6), (31, .7), (45.2, .2)]))
bed(bp(noise(), 300, 1200) * .025 * env([(0, 0), (10.4, 0), (11, 1), (15.7, 1), (16.1, 0), (45.2, 0)]))
bed(bp(noise(), 200, 900) * .035 * env([(0, 0), (15.8, 0), (16.2, 1), (18.2, 1), (18.6, 0), (45.2, 0)]), .3)
bed(bp(noise(), 400, 2500) * .03 * env([(0, 0), (7.8, 0), (8.3, 1), (10.4, 1), (10.8, 0), (18.4, 0), (18.8, 1), (31, 1), (31.4, 0), (45.2, 0)]), -.2)
bed(lp(noise(), 70) * .7 * env([(0, 0), (31, 0), (32, 1), (39, 1.2), (42.4, 1.5), (44.5, 1.7), (45.2, 0)]))
# --- events on the voice timeline
put(chime(660, 2.5), .3, .6); put(squeak(.8), 4.6, 1, .2); put(whoosh(.8), 5.2, 1, .1)
footsteps(8.2, 9.9, .55, .7, .3)
for t0 in (13.8, 16.0, 18.6):
    for j in range(5): put(chime(880 * 2 ** (j * 2 / 12), .9), t0 + j * .4, .3, (j - 2) * .25)
n = int(.5 * SR); put(bp(rng.standard_normal(n), 300, 2500) * dec(n, .12) * .8, 24.2, 1, .2)
put(boom(80, 1.2), 25.6, .35)
put(paper(.4), 27.0, 1, .2)
put(whoosh(.5), 28.4, 1.1, .2); put(boom(60, 1.4), 28.63, .9); put(thud(), 28.85, 1.0, .3)
put(thud(), 30.2, 1.1, .3); put(thud(), 30.6, .8, .4)
for i in range(5):
    for q in range(3): put(whoosh(.5), 31.2 + .2 + i * .75 + .3 + q * .2, .6, (-1) ** i * .5)
put(boom(40, 3), 31.3, .7); put(boom(45, 2.5), 37.4, .5)
for i in range(8): put(thud(), 39.2 + .3 + i * .32 + .4, .8, (i % 3 - 1) * .3)
put(boom(35, 3), 42.5, 1.0)
for b in (7.8, 10.4, 22.6, 31.2, 39.2): put(whoosh(), b - .2, .8, -.2)

def verb(x):
    y = x.copy()
    for d, g in ((1931, .28), (2593, .22), (3511, .18), (4799, .12)): y[d:] += x[:-d] * g
    return lp(y, 9000)
L, Rt = verb(L), verb(np.roll(Rt, 150))
mx = np.stack([L, Rt], 1) * np.clip(np.minimum(t / .8, (DUR - t) / 1.2), 0, 1)[:, None]
mx = np.tanh(mx / np.percentile(np.abs(mx), 99.9) * .8) * .8

import subprocess
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice', 'voice.m4a'), '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768
vo = np.zeros((N, 2), np.float32); vo[:min(N, len(v))] = v[:N]
vo /= max(1e-6, np.abs(vo).max()) / .89
envv = np.abs(vo).mean(1); w = SR // 8; c = np.cumsum(np.concatenate([[0], envv])); envv = np.pad((c[w:] - c[:-w]) / w, (w // 2, N - (len(c) - w) - w // 2), mode='edge')
duck = 1 - .55 * np.clip(envv / (np.percentile(envv, 95) * .5 + 1e-9), 0, 1)
out = mx * duck[:, None] * .45 + vo
out = np.tanh(out * 1.05) * .95
with wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'soundtrack_voice.wav'), 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((out * 32767).astype(np.int16).tobytes())
print('soundtrack_voice.wav written')
