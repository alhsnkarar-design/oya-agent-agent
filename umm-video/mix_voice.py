"""Mix the Arabic voiceover into the film.
Put one audio file per line in vo/ named by id (vo/00.mp3 … vo/11.mp3, any format ffmpeg reads),
then run:  python3 mix_voice.py   ->  video/umm_voice.mp4
Each line is placed at its 'at' time from narration.json; the sound design is ducked under the voice."""
import json, os, subprocess, numpy as np, wave
from scipy.signal import butter, sosfilt

def movavg(x, w):
    c = np.cumsum(np.concatenate([[0], x])); y = (c[w:] - c[:-w]) / w
    return np.pad(y, (w // 2, len(x) - len(y) - w // 2), mode='edge')

ROOT = os.path.dirname(os.path.abspath(__file__)); SR = 48000
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

with wave.open(os.path.join(ROOT, 'soundtrack.wav')) as f:
    bg = np.frombuffer(f.readframes(f.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
N = len(bg); vo = np.zeros(N, np.float32)
for ln in json.load(open(os.path.join(ROOT, 'narration.json'), encoding='utf-8')):
    cand = [p for p in os.listdir(os.path.join(ROOT, 'vo')) if os.path.splitext(p)[0] == ln['id']]
    if not cand: print('missing line', ln['id']); continue
    x = load(os.path.join(ROOT, 'vo', cand[0])); x /= max(1e-6, np.percentile(np.abs(x), 99.5))
    i = int(ln['at'] * SR); n = min(len(x), N - i); vo[i:i + n] += x[:n] * .55
    end = (i + n) / SR
    if end > ln['at'] + 9: print(f"warning: line {ln['id']} runs to {end:.1f}s")
# gentle voice EQ (remove rumble, add presence) + room tail
vo = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), vo)
tail = vo.copy()
for d, g in ((2400, .12), (3900, .08), (5600, .05)): tail[d:] += vo[:-d] * g
# sidechain ducking
envv = movavg(np.abs(vo), SR // 10)
duck = 1 - .6 * np.clip(envv / (envv.max() * .25 + 1e-9), 0, 1)
duck = movavg(duck, SR // 5)
mix = bg * duck[:, None] * .8 + tail[:, None]
mix = np.tanh(mix * 1.1) * .95
out = os.path.join(ROOT, 'out_voice.wav')
with wave.open(out, 'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(ROOT, 'video', 'umm.mp4'), '-i', out, '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', os.path.join(ROOT, 'video', 'umm_voice.mp4')], check=True)
os.remove(out); print('video/umm_voice.mp4 written')
