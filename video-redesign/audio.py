"""Procedural sound design (music bed + SFX) synced to the animation timeline.
Pure numpy, no samples -> out/audio.wav (48 kHz stereo)."""
import numpy as np, wave, os

SR = 48000
DUR = 24.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def tt(d): return np.arange(int(SR * d)) / SR

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[:j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414
    R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.414

def env(n, a=0.005, d=0.3, curve=4):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e

def lp(x, k):  # one-pole lowpass, k in (0,1)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += k * (x[i] - acc); y[i] = acc
    return y

def noise(d): return rng.standard_normal(int(SR * d))

def M(*xs):  # sum signals of different lengths
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

# ---------- instruments ----------
def sine(f, d, a=.005, dec=.4, c=4):
    t = tt(d); return np.sin(2 * np.pi * f * t) * env(len(t), a, dec, c)

def pluck(f, d=.6):
    t = tt(d); s = sum(np.sin(2 * np.pi * f * h * t) / h ** 1.6 for h in range(1, 6))
    return s * env(len(t), .003, d * .5, 5) * .5

def pop(d=.12, f0=900, f1=300):
    t = tt(d); f = np.linspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(t), .002, d, 6)

def whoosh(d=.6, rev=False):
    n = noise(d); t = tt(d)
    k = .02 + .25 * np.sin(np.pi * t / d) ** 2
    y = np.empty_like(n); acc = 0.0
    for i in range(len(n)):
        acc += k[i] * (n[i] - acc); y[i] = acc
    e = np.sin(np.pi * t / d) ** 2
    if rev: e = (t / d) ** 2 * (t < d)
    return y * e * 1.6

def impact(d=1.6):
    t = tt(d); f = 40 + 120 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .001, .9, 3.5)
    crack = lp(noise(d), .35) * env(len(t), .001, .15, 6)
    return M(body * 1.1, crack * .8)

def riser(d=1.2):
    t = tt(d); f = 200 * (8 ** (t / d))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + lp(noise(d), .15) * .6
    return s * (t / d) ** 2

def click(): return lp(noise(.03), .5) * env(int(SR * .03), .0005, .01, 6) * 1.2

def tick(): return M(sine(2400, .05, .0005, .02, 6) * .5, click() * .3)

def glitch(d=.4):
    t = tt(d); sq = np.sign(np.sin(2 * np.pi * 110 * t * (1 + 3 * (rng.random(len(t)) > .97))))
    gate = (np.floor(t * 40) % 2) * (rng.random(int(d * 40) + 1)[np.floor(t * 40).astype(int)] > .3)
    return (sq * .35 + noise(d) * .25) * gate * env(len(t), .001, d, 2)

def chime(freqs, step=.07, d=1.2):
    out = np.zeros(int(SR * (d + step * len(freqs))))
    for k, f in enumerate(freqs):
        s = M(sine(f, d, .002, d * .4, 4) * .6, sine(f * 2, d * .6, .002, .2, 5) * .2)
        i = int(k * step * SR); out[i:i + len(s)] += s
    return out

def coin():
    return chime([1975, 2637], .06, .5) * .7

def shimmer(d=1.5):
    out = np.zeros(int(SR * d))
    for k in range(18):
        f = 2000 + rng.random() * 4000; s = sine(f, .4, .002, .15, 5) * .15
        i = int(rng.random() * (d - .4) * SR); out[i:i + len(s)] += s
    return out

# ---------- music bed: 100 bpm ----------
BPM = 100; beat = 60 / BPM
chords = [[130.81, 155.56, 196.0, 233.08], [103.83, 130.81, 155.56, 196.0],
          [116.54, 146.83, 174.61, 233.08], [98.0, 123.47, 146.83, 196.0]]  # Cm9 Ab Bb G
bar = beat * 4
t_bar = 0.0; ci = 0
while t_bar < DUR:
    d = bar + .6; t = tt(d)
    pad = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * .3 * t) * .4) + .5 * np.sin(2 * np.pi * f * 1.005 * t) for f in chords[ci % 4])
    pad = lp(pad, .08) * np.minimum(1, t / .8) * np.minimum(1, np.maximum(0, d - t) / .6) * .05
    add(pad, t_bar, 1.0, 0)
    t_bar += bar; ci += 1

# drums start after the zero impact; break in scene 4 build
for k in range(int(DUR / beat)):
    tb = k * beat
    if tb < 1.2 or tb > 23.2: continue
    if 11.6 < tb < 13.0: continue  # drop-out before brand reveal
    if k % 2 == 0: add(M(sine(55, .45, .002, .3, 5), sine(110, .08, .001, .05, 6) * .4), tb, .55)
    else: add(lp(noise(.2), .45) * env(int(SR * .2), .001, .12, 6), tb, .22)  # snare-ish
    for h in (0, .5):
        add(noise(.04) * env(int(SR * .04), .0005, .02, 6) - lp(noise(.04), .3) * env(int(SR * .04), .0005, .02, 6), tb + h * beat, .07, .3)
# bass
bass_notes = [65.41, 51.91, 58.27, 49.0]
for k in range(int(DUR / beat)):
    tb = k * beat
    if tb < 1.2 or tb > 23.2 or 11.6 < tb < 13.0: continue
    f = bass_notes[int(tb / bar) % 4]
    add(pluck(f, beat * .9) * 1.2, tb + beat * .5, .45)
# arp sparkle in scenes 3 and 6
arp = [523.25, 622.25, 783.99, 932.33]
for k in range(int(DUR / (beat / 2))):
    tb = k * beat / 2
    if (8.4 < tb < 11.6) or (20.3 < tb < 23.6):
        add(pluck(arp[k % 4], .4), tb, .09, (-.5 if k % 2 else .5))

# ---------- SFX timeline ----------
add(riser(1.2), 0.0, .35)
for s, f in [(0, 880), (.4, 988), (.8, 1175)]: add(sine(f, .25, .002, .12, 5), s, .35); add(whoosh(.3), s, .25)
add(impact(), 1.22, .9); add(glitch(.35), 1.22, .25); add(shimmer(1.2), 1.3, .5)
for i in range(5): add(pop(.08, 700 + i * 80, 400), .05 + i * .12, .12)
add(sine(1000, .12, .001, .08, 5), 2.25, .25)  # REC beep
add(whoosh(.5), 2.6, .5); add(pop(.15, 500, 180), 2.8, .5)
# scene 2
add(whoosh(.7), 3.95, .55)
for a in (4.4, 5.05, 5.75): add(whoosh(.45), a - .05, .45, .4); add(pop(.1, 600, 250), a + .2, .35)
add(coin(), 5.25, .6); add(coin(), 5.4, .4, .5); add(coin(), 5.55, .35, -.5)
add(glitch(.45), 5.95, .55); add(sine(90, .4, .002, .3, 4), 5.95, .5)
for i, a in enumerate((6.5, 6.68)): add(pop(.1, 900 + i * 200, 400), a, .35)
add(chime([1046.5, 1318.5, 1568]), 6.9, .35)
# scene 3
add(whoosh(.7), 7.85, .55); add(pop(.12, 1200, 500), 8.4, .35)
add(whoosh(.8), 8.5, .35)
n = 24
for i in range(n): add(M(tick(), click() * .4), 9.15 + i * (1.0 / n) + rng.random() * .01, .45, rng.random() - .5)
add(click() * 2, 10.22, .8); add(riser(.5), 9.85, .3)
add(shimmer(1.0), 10.35, .7); add(impact(.6), 10.38, .35)
for i in range(5): add(pop(.09, 600 + i * 120, 300), 10.67 + i * .07, .3, -.6 + i * .3)
add(whoosh(.5), 11.1, .45); add(pop(.15, 500, 180), 11.2, .4)
# scene 4
add(whoosh(1.0, True), 11.8, .8); add(riser(1.0), 12.0, .45)
for i in range(8): add(pop(.07, 1100 - i * 40, 500), 12.55 + i * .06, .25, -.7 + i * .2)
add(impact(2.0), 13.0, 1.0); add(shimmer(2.0), 13.0, .7); add(glitch(.3), 13.0, .2)
for i, tb in enumerate([13.15, 13.6, 14.05, 14.5, 14.95, 15.4]):  # building blocks landing
    add(M(sine(130 + i * 12, .25, .001, .12, 5), click() * .8), tb, .45, -.4)
add(pop(.18, 400, 1400), 15.42, .3); add(chime([1046.5, 1568]), 15.85, .3)  # bulb hops on top
# bulb character: switch-on, hops and coin
add(click() * 2, 1.33, .6); add(M(sine(1760, .5, .002, .3, 4) * .4, sine(2637, .4, .002, .2, 5) * .2), 1.4, .4)
t_ = tt(.45); add(np.sin(2 * np.pi * 60 * t_) * np.sign(np.sin(2 * np.pi * 120 * t_)) * env(len(t_), .01, .4, 3) * .3, 1.36, .25)  # mains hum flicker
for h in [1.9, 2.72, 5.22, 7.0, 10.4, 11.25, 17.05, 21.25, 22.45, 23.05, 23.6]:
    add(pop(.16, 300, 900), h, .22)      # take-off
for c in [5.85, 6.15, 21.95]: add(chime([2093, 2637], .04, .35), c, .3)

add(pop(.15, 500, 180), 13.7, .35)
# scene 5
add(whoosh(.7), 15.85, .55); add(whoosh(.5), 16.35, .35, .5); add(whoosh(.5), 16.75, .35, -.5)
add(chime([783.99, 987.77, 1174.66, 1567.98], .08, 1.4), 17.05, .5); add(shimmer(1.0), 17.05, .45)
add(whoosh(.5), 18.0, .35, -.5)
t = tt(.9); fall = np.sin(2 * np.pi * np.cumsum(np.linspace(420, 90, len(t))) / SR) * env(len(t), .002, .9, 2.5)
add(fall, 18.45, .35); add(glitch(.5), 18.45, .45)
# scene 6
add(whoosh(.7), 19.85, .55)
for i in range(5): add(pop(.08, 700 + i * 90, 350), 20.35 + i * .1, .18)
add(whoosh(.5), 20.4, .35, .6); add(pop(.12, 800, 300), 20.65, .4)
add(click() * 2.5, 21.1, .9); add(impact(.8), 21.12, .5); add(shimmer(1.6), 21.15, .8)
add(chime([1046.5, 1318.5, 1568, 2093]), 21.2, .55)
add(whoosh(.5), 21.85, .35); add(shimmer(1.2), 22.1, .5)
add(chime([523.25, 783.99, 1046.5], .12, 1.8), 22.8, .3)

# ---------- master ----------
mix = np.stack([L, R], 1)
fade = np.ones(N); fo = int(SR * .8); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)  # soft clip / glue
mix *= .89 / np.max(np.abs(mix))
os.makedirs('out', exist_ok=True)
with wave.open('out/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('audio ok', mix.shape)
