// ============================================================
// Gashapon Sound System — Web Audio API (no audio files needed)
// ============================================================

type SFXType = "click" | "crank" | "drop" | "open" | "success";

class AudioSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private _muted = false;
  private ambientNodes: AudioNode[] = [];
  private ambientStarted = false;
  private sparkleTimer: ReturnType<typeof setTimeout> | null = null;

  // Lazy-init AudioContext (browsers require user gesture first)
  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();

      // Master gain (mute control)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);

      // Separate ambient gain (quieter)
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.18;
      this.ambientGain.connect(this.masterGain);
    }
    return this.ctx;
  }

  get muted() {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this._muted ? 0 : 1,
        this.getCtx().currentTime,
        0.1
      );
    }
    return this._muted;
  }

  // ── Ambient music ─────────────────────────────────────────
  // Cozy lo-fi pad: detuned sine waves on A minor chord
  // + occasional soft pentatonic sparkle notes

  startAmbient() {
    if (this.ambientStarted) return;
    const ctx = this.getCtx();
    const dest = this.ambientGain!;

    // Base chord: A2, E3, A3, C4 (Am pad)
    const chordFreqs = [110, 164.81, 220, 261.63];

    chordFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = freq + i * 0.15; // micro-detune per voice

      filter.type = "lowpass";
      filter.frequency.value = 700;
      filter.Q.value = 0.4;

      // Slow LFO tremolo per voice
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07 + i * 0.025;
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      gainNode.gain.value = 0.13 - i * 0.02;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);

      osc.start();
      lfo.start();

      this.ambientNodes.push(osc, lfo, filter);
    });

    // Sub-bass hum
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = "sine";
    bass.frequency.value = 55; // A1
    bassGain.gain.value = 0.06;
    bass.connect(bassGain);
    bassGain.connect(dest);
    bass.start();
    this.ambientNodes.push(bass);

    this.scheduleSparkle(ctx, dest);
    this.ambientStarted = true;
  }

  private scheduleSparkle(ctx: AudioContext, dest: GainNode) {
    const delay = 2500 + Math.random() * 5000;
    this.sparkleTimer = setTimeout(() => {
      if (!this.ambientStarted) return;
      this.playSparkleNote(ctx, dest);
      this.scheduleSparkle(ctx, dest);
    }, delay);
  }

  private playSparkleNote(ctx: AudioContext, dest: GainNode) {
    // Pentatonic scale notes (soft, high register)
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    osc.connect(gainNode);
    gainNode.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  }

  stopAmbient() {
    if (this.sparkleTimer) clearTimeout(this.sparkleTimer);
    this.ambientNodes.forEach((n) => {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        // already stopped
      }
    });
    this.ambientNodes = [];
    this.ambientStarted = false;
  }

  // ── SFX ──────────────────────────────────────────────────

  playSFX(type: SFXType) {
    const ctx = this.getCtx();
    // Resume suspended context (needed in some browsers)
    if (ctx.state === "suspended") ctx.resume();
    const dest = this.masterGain!;

    switch (type) {
      case "click":   return this.sfxClick(ctx, dest);
      case "crank":   return this.sfxCrank(ctx, dest);
      case "drop":    return this.sfxDrop(ctx, dest);
      case "open":    return this.sfxOpen(ctx, dest);
      case "success": return this.sfxSuccess(ctx, dest);
    }
  }

  // Short square-wave UI click
  private sfxClick(ctx: AudioContext, dest: GainNode) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 520;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    osc.connect(g); g.connect(dest);
    osc.start(); osc.stop(ctx.currentTime + 0.07);
  }

  // Mechanical ratchet crank
  private sfxCrank(ctx: AudioContext, dest: GainNode) {
    for (let i = 0; i < 5; i++) {
      const t = ctx.currentTime + i * 0.07;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180 - i * 12, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      osc.connect(g); g.connect(dest);
      osc.start(t); osc.stop(t + 0.07);
    }
  }

  // Capsule bouncing into the slot
  private sfxDrop(ctx: AudioContext, dest: GainNode) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.22);
    g.gain.setValueAtTime(0.28, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(g); g.connect(dest);
    osc.start(); osc.stop(ctx.currentTime + 0.28);

    // Small secondary bounce
    setTimeout(() => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(220, ctx.currentTime);
      o2.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      g2.gain.setValueAtTime(0.1, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      o2.connect(g2); g2.connect(dest);
      o2.start(); o2.stop(ctx.currentTime + 0.14);
    }, 260);
  }

  // Ascending sparkle chime — capsule open
  private sfxOpen(ctx: AudioContext, dest: GainNode) {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.075;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.11, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(g); g.connect(dest);
      osc.start(t); osc.stop(t + 0.35);
    });
  }

  // Victory jingle — all capsules opened
  private sfxSuccess(ctx: AudioContext, dest: GainNode) {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(g); g.connect(dest);
      osc.start(t); osc.stop(t + 0.22);
    });
  }
}

export const sounds = new AudioSystem();
