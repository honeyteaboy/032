/**
 * Aetheria JRPG Audio Engine
 * Uses the Web Audio API to procedurally synthesize authentic JRPG sound effects
 * and melodic BGM without relying on external audio assets that could break or fail to load.
 */

class JrpgAudioEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentBgm: string | null = null;
  private bgmInterval: any = null;
  public isMuted: boolean = false;
  public bgmVolume: number = 0.35;
  public sfxVolume: number = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.isMuted ? 0 : this.bgmVolume;
        this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
        this.bgmGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.value = muted ? 0 : this.bgmVolume;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = muted ? 0 : this.sfxVolume;
    }
  }

  public playSfx(type: 'click' | 'select' | 'cancel' | 'slash' | 'magic' | 'heal' | 'equip' | 'chest' | 'levelup' | 'victory' | 'flee') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain);

      switch (type) {
        case 'click':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'select':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now); // A4
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'cancel':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
          break;

        case 'slash': {
          // White noise burst + pitch swoop for sword hit
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.22);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        }

        case 'magic': {
          // Shimmering arpeggio
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((freq, idx) => {
            const subOsc = this.ctx!.createOscillator();
            const subGain = this.ctx!.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
            subGain.gain.setValueAtTime(0.25, now + idx * 0.05);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
            subOsc.connect(subGain);
            subGain.connect(this.sfxGain!);
            subOsc.start(now + idx * 0.05);
            subOsc.stop(now + idx * 0.05 + 0.25);
          });
          break;
        }

        case 'heal': {
          const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
          notes.forEach((freq, idx) => {
            const subOsc = this.ctx!.createOscillator();
            const subGain = this.ctx!.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
            subGain.gain.setValueAtTime(0.2, now + idx * 0.08);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
            subOsc.connect(subGain);
            subGain.connect(this.sfxGain!);
            subOsc.start(now + idx * 0.08);
            subOsc.stop(now + idx * 0.08 + 0.3);
          });
          break;
        }

        case 'chest': {
          const fanfare = [392, 440, 523.25, 659.25, 783.99];
          fanfare.forEach((f, i) => {
            const subOsc = this.ctx!.createOscillator();
            const subGain = this.ctx!.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(f, now + i * 0.09);
            subGain.gain.setValueAtTime(0.3, now + i * 0.09);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
            subOsc.connect(subGain);
            subGain.connect(this.sfxGain!);
            subOsc.start(now + i * 0.09);
            subOsc.stop(now + i * 0.09 + 0.35);
          });
          break;
        }

        case 'equip':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.setValueAtTime(880, now + 0.07);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
          break;

        case 'levelup': {
          const notes = [440, 554.37, 659.25, 880, 1108.73];
          notes.forEach((f, i) => {
            const subOsc = this.ctx!.createOscillator();
            const subGain = this.ctx!.createGain();
            subOsc.type = 'square';
            subOsc.frequency.setValueAtTime(f, now + i * 0.1);
            subGain.gain.setValueAtTime(0.15, now + i * 0.1);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
            subOsc.connect(subGain);
            subGain.connect(this.sfxGain!);
            subOsc.start(now + i * 0.1);
            subOsc.stop(now + i * 0.1 + 0.35);
          });
          break;
        }

        default:
          break;
      }
    } catch {
      // Audio context might be restricted by user gesture policy
    }
  }

  public playBgm(theme: 'town' | 'field' | 'battle' | 'dungeon' | 'victory') {
    if (this.currentBgm === theme) return;
    this.stopBgm();
    this.currentBgm = theme;
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx || !this.bgmGain) return;

      // Melodic JRPG arpeggio themes
      let chords: number[][] = [];
      let tempo = 300; // ms per chord step

      if (theme === 'town') {
        // Serene major scale town melody (C - F - G - Am)
        chords = [
          [261.63, 329.63, 392.00, 523.25], // C maj
          [349.23, 440.00, 523.25, 698.46], // F maj
          [392.00, 493.88, 587.33, 783.99], // G maj
          [220.00, 261.63, 329.63, 440.00], // A min
        ];
        tempo = 380;
      } else if (theme === 'battle') {
        // Dramatic fast tempo battle progression (Dm - Bb - C - A7)
        chords = [
          [293.66, 349.23, 440.00, 587.33], // D min
          [233.08, 293.66, 349.23, 466.16], // Bb maj
          [261.63, 329.63, 392.00, 523.25], // C maj
          [220.00, 277.18, 329.63, 440.00], // A maj / A7
        ];
        tempo = 210;
      } else if (theme === 'dungeon') {
        // Mysterious low atmospheric theme (Em - Bm - C - B7)
        chords = [
          [164.81, 196.00, 246.94, 329.63], // E min
          [123.47, 146.83, 185.00, 246.94], // B min
          [130.81, 164.81, 196.00, 261.63], // C maj
          [123.47, 155.56, 185.00, 246.94], // B maj
        ];
        tempo = 450;
      } else if (theme === 'field') {
        // Adventurous open world theme (G - D - Em - C)
        chords = [
          [196.00, 246.94, 293.66, 392.00], // G
          [146.83, 220.00, 293.66, 369.99], // D
          [164.81, 196.00, 246.94, 329.63], // Em
          [130.81, 164.81, 196.00, 261.63], // C
        ];
        tempo = 320;
      } else {
        // Victory fanfare
        chords = [
          [261.63, 329.63, 392.00, 523.25],
          [349.23, 440.00, 523.25, 698.46],
          [392.00, 493.88, 587.33, 783.99],
          [523.25, 659.25, 783.99, 1046.5],
        ];
        tempo = 280;
      }

      let step = 0;
      this.bgmInterval = setInterval(() => {
        if (!this.ctx || !this.bgmGain || this.isMuted) return;
        const now = this.ctx.currentTime;
        const chordIdx = Math.floor(step / 4) % chords.length;
        const noteIdx = step % 4;
        const freq = chords[chordIdx][noteIdx];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = theme === 'battle' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (tempo / 1000) * 1.5);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + (tempo / 1000) * 1.6);

        step++;
      }, tempo);
    } catch {
      // Audio autoplay policy
    }
  }

  public stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgm = null;
  }
}

export const audioManager = new JrpgAudioEngine();
