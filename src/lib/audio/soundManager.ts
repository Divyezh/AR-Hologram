'use client';

import { Howl, Howler } from 'howler';

// Utility to create a procedural WAV Data URI in the browser
function createWavDataUri(sampleRate: number, samples: Float32Array): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

// Generate sound waveforms
function generateMandalaSoundUri(): string {
  const sampleRate = 22050;
  const duration = 2.0; // 2 seconds seamless loop
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Layered mystic resonance (92Hz root + 184Hz octave + 368Hz 5th harmonic)
    const baseHum = Math.sin(2 * Math.PI * 92 * t) * 0.4;
    const harmonic = Math.sin(2 * Math.PI * 184 * t + Math.sin(2 * Math.PI * 4 * t)) * 0.25;
    const shimmer = Math.sin(2 * Math.PI * 550 * t) * (0.1 + 0.05 * Math.sin(2 * Math.PI * 8 * t));
    // High spark crackle
    const noise = (Math.random() * 2 - 1) * 0.08 * (Math.sin(2 * Math.PI * 16 * t) > 0.5 ? 1 : 0.2);

    samples[i] = (baseHum + harmonic + shimmer + noise) * 0.7;
  }
  return createWavDataUri(sampleRate, samples);
}

function generateFireSoundUri(): string {
  const sampleRate = 22050;
  const duration = 2.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Pink / Brown noise filter for deep fire roar
    const white = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + white * 0.05;
    b1 = 0.96 * b1 + white * 0.11;
    b2 = 0.86 * b2 + white * 0.25;
    const roar = (b0 + b1 + b2) * 0.5;

    // Embers crackle pops
    const isPop = Math.random() > 0.996;
    const pop = isPop ? (Math.random() * 2 - 1) * 0.8 : 0;

    // Wind gust pulsation
    const gust = 0.7 + 0.3 * Math.sin(2 * Math.PI * 2.5 * t);

    samples[i] = (roar * gust + pop) * 0.8;
  }
  return createWavDataUri(sampleRate, samples);
}

function generateIgniteSoundUri(): string {
  const sampleRate = 22050;
  const duration = 0.6;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 5.0); // Fast decay
    // Frequency sweep upward for spell ignition
    const freq = 120 + 600 * Math.pow(t / duration, 2);
    const tone = Math.sin(2 * Math.PI * freq * t);
    const noise = (Math.random() * 2 - 1) * Math.exp(-t * 8.0) * 0.5;

    samples[i] = (tone * 0.6 + noise) * env;
  }
  return createWavDataUri(sampleRate, samples);
}

function generateClickSoundUri(): string {
  const sampleRate = 22050;
  const duration = 0.08;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 45.0);
    const tone = Math.sin(2 * Math.PI * 1200 * t);
    samples[i] = tone * env * 0.4;
  }
  return createWavDataUri(sampleRate, samples);
}

class ARSoundManager {
  private mandalaSound: Howl | null = null;
  private fireSound: Howl | null = null;
  private narutoSound: Howl | null = null;
  private igniteSound: Howl | null = null;
  private clickSound: Howl | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private activeLoop: Howl | null = null;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      this.mandalaSound = new Howl({
        src: [generateMandalaSoundUri()],
        loop: true,
        volume: 0.55,
      });

      this.fireSound = new Howl({
        src: [generateFireSoundUri()],
        loop: true,
        volume: 0.65,
      });

      this.narutoSound = new Howl({
        src: ['/audio/naruto-rasengan.mp3'],
        loop: true,
        volume: 0.75,
        html5: true,
      });

      this.igniteSound = new Howl({
        src: [generateIgniteSoundUri()],
        volume: 0.8,
      });

      this.clickSound = new Howl({
        src: [generateClickSoundUri()],
        volume: 0.35,
      });

      this.isInitialized = true;
    } catch (err) {
      console.warn('Howler sound initialization error:', err);
    }
  }

  public playIgnite() {
    if (this.isMuted) return;
    this.init();
    this.igniteSound?.play();
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    this.clickSound?.play();
  }

  public startEffectSound(soundType: 'mandala' | 'fire' | 'cosmic' | 'lightning' | 'naruto') {
    if (this.isMuted) return;
    this.init();

    const targetLoop = soundType === 'naruto'
      ? this.narutoSound
      : soundType === 'fire'
        ? this.fireSound
        : this.mandalaSound;

    if (this.activeLoop === targetLoop && this.activeLoop?.playing()) {
      return;
    }

    // Fade out previous
    if (this.activeLoop && this.activeLoop.playing()) {
      this.activeLoop.fade(this.activeLoop.volume(), 0, 300);
      setTimeout(() => this.activeLoop?.stop(), 300);
    }

    if (targetLoop) {
      targetLoop.volume(0);
      targetLoop.play();
      const targetVolume = soundType === 'naruto' ? 0.75 : soundType === 'fire' ? 0.6 : 0.45;
      targetLoop.fade(0, targetVolume, 400);
      this.activeLoop = targetLoop;
    }
  }

  public stopEffectSound() {
    if (this.activeLoop && this.activeLoop.playing()) {
      this.activeLoop.fade(this.activeLoop.volume(), 0, 350);
      const loopToStop = this.activeLoop;
      setTimeout(() => loopToStop.stop(), 350);
      this.activeLoop = null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    Howler.mute(muted);
    if (muted) {
      this.stopEffectSound();
    }
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new ARSoundManager();
