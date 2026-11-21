/** Tiny WebAudio sound effects (no files). Starts on the first user gesture; can be muted. */
let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; };
export const isMuted = () => muted;
export function unlockAudio() {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { ctx = null; }
}
function tone(f0: number, f1: number, dur: number, type: OscillatorType = 'square', vol = 0.08, delay = 0) {
  if (muted || !ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
export const sfx = {
  collect: (n = 0) => tone(740 + (n % 5) * 90, 1480 + (n % 5) * 120, 0.12, 'square', 0.06),
  jump: () => tone(260, 640, 0.18, 'sine', 0.1),
  slide: () => tone(420, 160, 0.18, 'triangle', 0.08),
  lane: () => tone(380, 300, 0.06, 'sine', 0.05),
  hit: () => { tone(220, 60, 0.3, 'sawtooth', 0.12); tone(160, 50, 0.25, 'square', 0.08, 0.05); },
  over: () => { tone(440, 220, 0.25, 'triangle', 0.1); tone(330, 165, 0.3, 'triangle', 0.1, 0.22); tone(220, 90, 0.5, 'triangle', 0.1, 0.46); },
  go: () => { tone(523, 784, 0.15, 'triangle', 0.08); tone(784, 1046, 0.2, 'triangle', 0.08, 0.12); },
};
