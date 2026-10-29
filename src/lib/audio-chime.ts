/**
 * Web Audio API synthesizer for crisp, zero-latency "Ting-Ting!" chime sound
 * Works 100% offline without external MP3 files or CORS issues
 */
export function playChimeSound() {
  let ctx: AudioContext | null = null;
  let isClosed = false;
  const safeClose = () => {
    if (ctx && !isClosed && ctx.state !== 'closed') {
      isClosed = true;
      ctx.close().catch(() => {});
    }
  };

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch((err) => {
        console.warn('[Audio Chime] resume failed:', err);
        safeClose();
      });
    }

    if (ctx.state === 'closed') return;
    const now = ctx.currentTime;

    // First Tone: G5 (784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);

    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.25);
    osc1.onended = () => {
      osc1.disconnect();
      gain1.disconnect();
    };

    // Second Tone: C6 (1046.5Hz) - Chime higher note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.1);

    gain2.gain.setValueAtTime(0.35, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
    osc2.onended = () => {
      osc2.disconnect();
      gain2.disconnect();
      safeClose();
    };
  } catch (err) {
    console.warn('[Audio Chime Exception]:', err);
    safeClose();
  }
}
