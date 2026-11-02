"""Procedural sound design (no music instruments): wind, water, fire, thunder,
impacts and whooshes, synchronised with the scene timeline in index.html."""
import numpy as np
from scipy.signal import butter, sosfilt
import wave, os

SR, DUR = 48000, 100.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def noise(n=N): return rng.standard_normal(n)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(points):  # piecewise-linear envelope [(time, gain), ...]
    ts, gs = zip(*points); return np.interp(t, ts, gs)
def smooth_lfo(rate, seed):
    r = np.random.default_rng(seed); k = int(DUR * rate) + 4
    return np.interp(t * rate, np.arange(k), r.uniform(0.3, 1.0, k))

L = np.zeros(N); Rr = np.zeros(N)
def add(sig, pan=0.0):
    global L, Rr
    L += sig * np.sqrt((1 - pan) / 2) * 1.4142; Rr += sig * np.sqrt((1 + pan) / 2) * 1.4142

# --- desert / ambient wind (stereo decorrelated)
for s, pan in ((1, -.6), (2, .6)):
    w = bp(noise(), 180, 900) * smooth_lfo(.35, s) + bp(noise(), 900, 3000) * .25 * smooth_lfo(.6, s + 9)
    add(w * env([(0, .0), (2, .05), (8, .12), (22, .1), (24, .03), (33, .05), (35, .2), (44, .18), (46, .07), (57, .05), (72, .06), (88, .03), (96, .02), (100, 0)]), pan)

# --- low cinematic rumble bed
add(lp(noise(), 70, 4) * env([(0, 0), (3, .6), (8, .9), (20, .7), (44, .8), (56, 1.2), (71, 1.0), (77, 1.6), (86, 1.0), (95, .4), (100, 0)]) * 1.2)

# --- intro shimmer as particles converge
sh = hp(noise(), 6000) * env([(0, 0), (1, .02), (3.2, .09), (4.0, .02), (8, 0)])
add(sh, -.3); add(np.roll(sh, 900), .3)

# --- fire crackle (torches in Egypt, the fire at Tur)
crack = np.zeros(N)
for _ in range(9000):
    i = rng.integers(0, N - 400); crack[i:i + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 25) * rng.uniform(.2, 1)
crack = hp(crack, 1500)
fire_body = bp(noise(), 200, 1200) * smooth_lfo(4, 11)
fire_env = env([(0, 0), (8, 0), (10, .25), (21, .25), (22.5, 0), (44, 0), (46, .15), (50, .6), (52, .8), (58, .4), (59, 0), (100, 0)])
add((crack * .5 + fire_body * .35) * fire_env, .25)

# --- Nile water lapping
lap = bp(noise(), 300, 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * .45 * t) ** 2) * smooth_lfo(1.5, 21)
add(lap * env([(0, 0), (21, 0), (22.5, .25), (33, .25), (34.5, 0), (87, 0), (89, .18), (98, .12), (100, 0)]), -.2)
# crickets at night on the Nile
cr = np.sin(2 * np.pi * 4400 * t) * (np.sin(2 * np.pi * 30 * t) > .6) * (np.sin(2 * np.pi * .9 * t) > 0)
add(cr * .012 * env([(0, 0), (21, 0), (23, 1), (33, 1), (34.5, 0), (100, 0)]), .7)

# --- one-shots
def boom(at, gain=1.0, dur=4.0, f=55):
    n = int(dur * SR); k = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * k * np.exp(-k * .6)) * np.exp(-k * 1.6) + lp(rng.standard_normal(n), 140) * np.exp(-k * 2.5) * 2)
    i = int(at * SR); x = np.zeros(N); x[i:i + n] = s[:N - i]; add(x * gain)
def whoosh(at, gain=.5, dur=1.6, up=True):
    n = int(dur * SR); k = np.linspace(0, 1, n); s = rng.standard_normal(n)
    out = np.zeros(n); seg = n // 16
    for j in range(16):
        f = 300 + (j / 15 if up else 1 - j / 15) * 3500
        a, b = j * seg, min(n, (j + 1) * seg + seg)
        out[a:b] += bp(s[a:b], f * .7, f * 1.3) * np.hanning(b - a)
    out *= np.sin(np.pi * k) ** 2
    i = int(at * SR); x = np.zeros(N); x[i:i + n] = out[:N - i]; add(x * gain, -.4); add(np.roll(x, 600) * gain * .7, .4)
def thunder(at, gain=1.0):
    n = int(5 * SR); k = np.arange(n) / SR
    s = lp(rng.standard_normal(n), 400) * (np.exp(-k * 1.2) + .6 * np.exp(-((k - .4) / .2) ** 2))
    s += hp(rng.standard_normal(n), 2000) * np.exp(-k * 25) * .6
    i = int(at * SR); x = np.zeros(N); x[i:i + n] = s[:N - i]; add(x * gain, rng.uniform(-.5, .5))

for b in (8, 21, 33, 44, 57, 71, 87): whoosh(b - .3, .35)
boom(4.2, .8)                       # emblem forms
boom(52.2, 1.0, 5, 45)              # the call at Tur
boom(61.8, 1.4, 4, 60)              # staff hits the ground
whoosh(60.6, .5, 1.3, False)        # staff falling
# serpent hiss
hiss = hp(noise(), 5000) * env([(0, 0), (62.2, 0), (63, .05), (68.5, .07), (69.5, 0), (100, 0)]) * smooth_lfo(5, 31)
add(hiss, .1)
# sorcerers' ropes – eerie whispering band
add(bp(noise(), 600, 900, 4) * env([(0, 0), (57.5, 0), (59, .15), (64, .12), (69.5, 0), (100, 0)]) * smooth_lfo(3, 41), -.3)

# sea: storm, thunder, the strike, the split
storm = lp(noise(), 600) * smooth_lfo(.8, 51) + bp(noise(), 1000, 4000) * .3
add(storm * env([(0, 0), (71, 0), (72.5, .45), (77, .5), (78, .25), (82, .12), (88, 0), (100, 0)]), -.1)
thunder(72.3, 1.2); thunder(74.6, 1.0)
boom(77.0, 1.6, 6, 40)
whoosh(77.1, .9, 3.5, True)
roar = lp(noise(), 300) * env([(0, 0), (77, 0), (78, .8), (81, .6), (88, .15), (89, 0), (100, 0)])
add(roar)
boom(98.4, .4, 2, 50)               # final emblem

# --- simple stereo reverb tail (feedback delays)
def verb(x):
    y = x.copy()
    for d, g in ((1931, .35), (2593, .3), (3511, .25), (4799, .2)):
        y[d:] += x[:-d] * g
    return lp(y, 7000)
L, Rr = verb(L), verb(np.roll(Rr, 150))
mx = np.stack([L, Rr], 1)
fade = np.clip(np.minimum(t / 1.0, (DUR - t) / 1.5), 0, 1)[:, None]
mx *= fade
mx = np.tanh(mx / np.percentile(np.abs(mx), 99.9) * .9) * .85
pcm = (mx * 32767).astype(np.int16)
with wave.open(os.path.join(os.path.dirname(__file__), 'soundtrack.wav'), 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print('soundtrack.wav written', pcm.shape)
