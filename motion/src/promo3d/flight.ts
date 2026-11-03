// Camera flight for the 3D promo. Scene lengths are timed to public/voiceover.wav:
// each station is reached ~0.35s before its line (see marketing/promo-voiceover.md).
import { createFlight } from "../three/flight";

export const PROMO3D = createFlight({
  durs: [153, 176, 158, 152, 144, 173, 191, 125, 159],
  tLen: 12,
  impacts: (s) => [
    { at: s[0] + 90, amp: 0.2 },
    { at: s[1] + 18, amp: 0.08 }, { at: s[1] + 38, amp: 0.08 }, { at: s[1] + 60, amp: 0.08 }, { at: s[1] + 84, amp: 0.1 },
    { at: s[2] + 56, amp: 0.22 },
    { at: s[3] + 104, amp: 0.1 },
    { at: s[4] + 66, amp: 0.12 },
    { at: s[5] + 100, amp: 0.1 }, { at: s[5] + 132, amp: 0.12 },
    { at: s[7] + 72, amp: 0.12 },
    { at: s[8] + 74, amp: 0.16 },
  ],
});
