// Sistema de Micro-SFX Tátil (Música ambiente removida conforme solicitado)
// 100% nativo (Web Audio API) para cliques e transições sutis nos botões principais.

class MicroAudioEngine {
  private ctx: AudioContext | null = null;

  public init(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    this.ctx = new AudioCtx();
    return this.ctx;
  }

  public async unlockAndStart() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {}
    }
  }

  // Música ambiente desativada
  public start() {}
  public stop() {}
  public onVideoPlay() {}
  public onVideoPause() {}

  // Micro-SFX ultra sutil para os botões principais e áreas (toque refinado e discreto)
  public playSubtleAreaSfx() {
    this.init();
    if (!this.ctx) return;
    try {
      const ctx = this.ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const now = ctx.currentTime;

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(1.5, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.02);

      // Volume reduzido, bem sutil (0.02)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public toggle(): boolean {
    return false;
  }

  public active(): boolean {
    return false;
  }
}

export const soundEngine =
  typeof window !== 'undefined' ? new MicroAudioEngine() : (null as unknown as MicroAudioEngine);
