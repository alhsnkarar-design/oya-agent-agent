# Synthesised sound effects for the rug ad (no music): brush, spray, foam, scrub, rinse, whooshes, soft sea ambience.
import numpy as np, wave
SR, DUR = 48000, 15.0
n = int(SR * DUR); t = np.arange(n) / SR
rng = np.random.default_rng(7)
out = np.zeros(n)

def lp(x, a):            # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

def env(t0, t1, att=.05, rel=.12):
    e = np.clip((t - t0) / att, 0, 1) * np.clip((t1 - t) / rel, 0, 1)
    return e

white = rng.standard_normal(n)
dark = lp(white, .02); dark /= np.abs(dark).max()
mid = lp(white, .12); mid /= np.abs(mid).max()
hiss = white - lp(white, .35); hiss /= np.abs(hiss).max()

out += .06 * lp(rng.standard_normal(n), .004) / .02 * (0.6 + .4 * np.sin(2 * np.pi * t / 7))          # sea ambience
out += .5 * mid * env(1.0, 2.5) * (.55 + .45 * np.sin(2 * np.pi * 5 * t) ** 2)                         # dust brush
for t0 in (2.8, 4.0):
    out += .35 * hiss * env(t0, t0 + .5, .02, .1) * (.7 + .3 * (np.sin(2 * np.pi * 9 * t) > 0))          # spray bursts
    out += .25 * mid * env(t0 + .3, t0 + 1.1) * (rng.random(n) < .004)                                   # foam fizz
out += .55 * mid * env(5.2, 10.0, .2, .3) * (.45 + .55 * np.abs(np.sin(2 * np.pi * 3.6 * t)))         # scrub
pops = np.zeros(n)
for k in range(45):
    p0 = rng.uniform(5.3, 10.6); f = rng.uniform(900, 1700); i0 = int(p0 * SR); L = int(.03 * SR)
    seg = np.sin(2 * np.pi * np.linspace(f, f * 1.8, L) * np.arange(L) / SR) * np.exp(-np.arange(L) / (.006 * SR))
    pops[i0:i0 + L] += seg[: max(0, min(L, n - i0))] * rng.uniform(.04, .1)
out += pops
swoosh = lp(white, .05); swoosh /= np.abs(swoosh).max()
out += .6 * swoosh * env(10.0, 11.0, .25, .5)                                                           # rinse
air = white - lp(white, .6); air /= np.abs(air).max()
out += .08 * air * env(10.4, 11.3, .2, .4)                                                              # shimmer of clean fabric
for t0 in (0.0, 11.35, 13.15):                                                                          # transition whooshes
    e = env(t0, t0 + .55, .25, .3)
    out += .45 * lp(white, .03 + .1 * np.clip((t - t0) / .55, 0, 1).mean()) / .05 * e * .1
out /= np.abs(out).max() * 1.12
with wave.open('sfx.wav', 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print('ok')
