import { useCallback, useEffect, useRef, useState } from 'react';

// Sound effect types for the futuristic combat interface
export type SoundType = 
  | 'hover'
  | 'click'
  | 'focus'
  | 'scan'
  | 'granted'
  | 'denied'
  | 'pulse'
  | 'typing'
  | 'transition'
  | 'attack'
  | 'dodge'
  | 'victory'
  | 'defeat'
  | 'shine'   // Fox Melee Reflector — iconic metallic Ting!
  | 'laser'   // Arwing blaster chirp
  | 'arrow_shot' // Plasma Bow twang and high-speed energy release
  | 'arrow_hit'  // Plasma arrow impact discharge
  | 'bow_charge'; // Bowstring plasma charge build-up

// Global audio state shared across components, persisted in localStorage
let globalAudioMuted = false;
try {
  globalAudioMuted = localStorage.getItem('playnexus_audio_muted') === 'true';
} catch {
  // Ignored
}

export const useSound = () => {
  const [isMuted, setIsMuted] = useState<boolean>(globalAudioMuted);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize or resume Web Audio Context on user interaction
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      globalAudioMuted = next;
      try {
        localStorage.setItem('playnexus_audio_muted', String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  }, []);

  // Synthesize procedural sci-fi sound effects using Web Audio API
  const playSound = useCallback((type: SoundType) => {
    if (globalAudioMuted) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'hover': {
          // Subtle high-frequency blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'click': {
          // Cyber confirm chirp
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'focus': {
          // Laser scan tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.linearRampToValueAtTime(2400, now + 0.06);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'scan': {
          // Dual harmonic telemetry chirp
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(850, now);
          osc2.frequency.setValueAtTime(1700, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.12);
          osc2.stop(now + 0.12);
          break;
        }

        case 'granted': {
          // Uplifting cinematic sci-fi chord: C5 - E5 - G5 - C6
          const freqs = [523.25, 659.25, 783.99, 1046.50];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.8);
          });
          break;
        }

        case 'denied': {
          // Low resonant alert buzz
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.setValueAtTime(120, now + 0.1);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        case 'pulse': {
          // Low sub bass combat heartbeat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(70, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }

        case 'typing': {
          // Tiny subtle click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(2000 + Math.random() * 500, now);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }

        case 'transition': {
          // Subtle cyber whoosh / screen sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.14);
          break;
        }

        case 'attack': {
          // Kinetic punch impact drop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(65, now + 0.08);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'dodge': {
          // Fast airy swoosh
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(1100, now + 0.05);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          gain.gain.setValueAtTime(0.045, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'victory': {
          // Cyber fanfare arpeggio: C5 - E5 - G5 - C6
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            gain.gain.setValueAtTime(0, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.5);
          });
          break;
        }

        case 'defeat': {
          // Descending drone power-down
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(75, now + 0.45);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
        }

        case 'shine': {
          // Fox Melee Reflector — iconic high-pitched metallic electric "Ting!"
          // Layered: sharp attack sine spike + metallic shimmer overtone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const osc3 = ctx.createOscillator();
          const g1 = ctx.createGain();
          const g2 = ctx.createGain();
          const g3 = ctx.createGain();

          // Sharp spike — the iconic "Ting" attack transient
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(4200, now);
          osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.06);
          g1.gain.setValueAtTime(0.22, now);
          g1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          // Metallic mid overtone shimmer
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(3200, now + 0.01);
          osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
          g2.gain.setValueAtTime(0.1, now + 0.01);
          g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          // Resonant tail ring
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(1600, now + 0.04);
          osc3.frequency.exponentialRampToValueAtTime(800, now + 0.35);
          g3.gain.setValueAtTime(0.06, now + 0.04);
          g3.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          [osc1, osc2, osc3].forEach((o, i) => {
            const g = [g1, g2, g3][i];
            o.connect(g);
            g.connect(ctx.destination);
          });
          osc1.start(now); osc1.stop(now + 0.06);
          osc2.start(now + 0.01); osc2.stop(now + 0.2);
          osc3.start(now + 0.04); osc3.stop(now + 0.35);
          break;
        }

        case 'laser': {
          // Arwing Blaster — rising electric laser bolt chirp + muzzle flash crack
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const g1 = ctx.createGain();
          const g2 = ctx.createGain();

          // High-speed rising laser whip
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(800, now);
          osc1.frequency.exponentialRampToValueAtTime(3200, now + 0.045);
          osc1.frequency.exponentialRampToValueAtTime(600, now + 0.11);
          g1.gain.setValueAtTime(0.14, now);
          g1.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

          // Crack / impact layer
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(2400, now);
          osc2.frequency.exponentialRampToValueAtTime(400, now + 0.04);
          g2.gain.setValueAtTime(0.08, now);
          g2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc1.connect(g1); g1.connect(ctx.destination);
          osc2.connect(g2); g2.connect(ctx.destination);
          osc1.start(now); osc1.stop(now + 0.11);
          osc2.start(now); osc2.stop(now + 0.04);
          break;
        }

        case 'arrow_shot': {
          // Cyber Plasma Bow release: metallic string twang + whistling plasma bolt
          const oscTwang = ctx.createOscillator();
          const oscWhistle = ctx.createOscillator();
          const gTwang = ctx.createGain();
          const gWhistle = ctx.createGain();

          // String twang: rapid dropping harmonic (520Hz down to 140Hz)
          oscTwang.type = 'sawtooth';
          oscTwang.frequency.setValueAtTime(540, now);
          oscTwang.frequency.exponentialRampToValueAtTime(140, now + 0.08);
          gTwang.gain.setValueAtTime(0.18, now);
          gTwang.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          // Plasma bolt whistle / whoosh: high sine zip
          oscWhistle.type = 'sine';
          oscWhistle.frequency.setValueAtTime(1400, now);
          oscWhistle.frequency.exponentialRampToValueAtTime(2800, now + 0.03);
          oscWhistle.frequency.exponentialRampToValueAtTime(800, now + 0.12);
          gWhistle.gain.setValueAtTime(0.12, now);
          gWhistle.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          oscTwang.connect(gTwang); gTwang.connect(ctx.destination);
          oscWhistle.connect(gWhistle); gWhistle.connect(ctx.destination);
          oscTwang.start(now); oscTwang.stop(now + 0.08);
          oscWhistle.start(now); oscWhistle.stop(now + 0.12);
          break;
        }

        case 'arrow_hit': {
          // Plasma Arrow target penetration & energy discharge
          const oscCrack = ctx.createOscillator();
          const oscBoom = ctx.createOscillator();
          const gCrack = ctx.createGain();
          const gBoom = ctx.createGain();

          oscCrack.type = 'triangle';
          oscCrack.frequency.setValueAtTime(800, now);
          oscCrack.frequency.exponentialRampToValueAtTime(90, now + 0.09);
          gCrack.gain.setValueAtTime(0.25, now);
          gCrack.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          oscBoom.type = 'sine';
          oscBoom.frequency.setValueAtTime(220, now);
          oscBoom.frequency.exponentialRampToValueAtTime(45, now + 0.18);
          gBoom.gain.setValueAtTime(0.2, now);
          gBoom.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          oscCrack.connect(gCrack); gCrack.connect(ctx.destination);
          oscBoom.connect(gBoom); gBoom.connect(ctx.destination);
          oscCrack.start(now); oscCrack.stop(now + 0.09);
          oscBoom.start(now); oscBoom.stop(now + 0.18);
          break;
        }

        case 'bow_charge': {
          // Tension rising charge before release or plasma volley
          const osc = ctx.createOscillator();
          const g = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.22);
          g.gain.setValueAtTime(0.02, now);
          g.gain.linearRampToValueAtTime(0.15, now + 0.18);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

          osc.connect(g); g.connect(ctx.destination);
          osc.start(now); osc.stop(now + 0.24);
          break;
        }
      }
    } catch {
      // Gracefully silent if Web Audio is blocked or unsupported
    }
  }, [getAudioContext]);

  useEffect(() => {
    // Sync state
    setIsMuted(globalAudioMuted);
  }, []);

  return {
    playSound,
    isMuted,
    toggleMute,
  };
};
