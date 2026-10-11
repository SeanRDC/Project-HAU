// All sound is synthesised with the Web Audio API so there are no audio files
// to ship yet: soft ambience, a slow generative melody, footsteps and blips.

const SCALE = [0, 2, 4, 7, 9]; // major pentatonic

export class Audio {
  private ac: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private wind!: GainNode;
  private water!: GainNode;
  private noise!: AudioBuffer;
  private nextNote = 0;
  private nextChirp = 0;
  private step = 0;
  muted = false;

  /** Must be called from a key press, browsers block audio before that. */
  start(): void {
    if (this.ac) return;
    const ac = new AudioContext();
    this.ac = ac;
    this.master = ac.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(ac.destination);

    // one second of white noise, reused for wind, water and footsteps
    this.noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    this.wind = this.loopNoise('lowpass', 420, 0.05);
    this.water = this.loopNoise('bandpass', 2600, 0);

    // music goes through a feedback delay for a bit of space
    this.music = ac.createGain();
    this.music.gain.value = 0.5;
    const delay = ac.createDelay(1);
    delay.delayTime.value = 0.42;
    const feedback = ac.createGain();
    feedback.gain.value = 0.38;
    this.music.connect(this.master);
    this.music.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(this.master);
    this.nextNote = ac.currentTime + 1;
  }

  private loopNoise(type: BiquadFilterType, freq: number, gain: number): GainNode {
    const ac = this.ac!;
    const src = ac.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(this.master);
    src.start();
    return g;
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.ac) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.7, this.ac.currentTime, 0.05);
  }

  private tone(freq: number, at: number, length: number, gain: number, type: OscillatorType, out: AudioNode): void {
    const ac = this.ac!;
    const osc = ac.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + length + 0.05);
  }

  /**
   * Call every frame. `water` is 0..1 for how close the fountain is,
   * `night` 0..1, `indoor` softens the wind.
   */
  update(water: number, night: number, indoor: boolean): void {
    const ac = this.ac;
    if (!ac) return;
    const now = ac.currentTime;
    this.water.gain.setTargetAtTime(water * 0.07, now, 0.2);
    this.wind.gain.setTargetAtTime(indoor ? 0.015 : 0.05, now, 0.5);

    if (now >= this.nextNote) {
      // wander up and down the scale in small steps, lower and sparser at night
      this.step = Math.max(0, Math.min(9, this.step + Math.floor(Math.random() * 5) - 2));
      const root = night > 0.5 ? 196 : 261.63;
      const semis = SCALE[this.step % 5] + 12 * Math.floor(this.step / 5);
      const f = root * Math.pow(2, semis / 12);
      this.tone(f, now, 2.6, 0.09, 'triangle', this.music);
      this.tone(f * 2, now, 1.2, 0.025, 'sine', this.music);
      if (Math.random() < 0.3) this.tone(root / 2, now, 4, 0.06, 'sine', this.music);
      this.nextNote = now + (night > 0.5 ? 1.4 : 0.9) * (Math.random() < 0.3 ? 2 : 1) + Math.random() * 0.5;
    }

    if (night > 0.6 && !indoor && now >= this.nextChirp) {
      for (let i = 0; i < 3; i++) this.tone(4200 + Math.random() * 300, now + i * 0.07, 0.05, 0.012, 'sine', this.master);
      this.nextChirp = now + 0.6 + Math.random() * 1.6;
    }
  }

  footstep(hard: boolean): void {
    const ac = this.ac;
    if (!ac) return;
    const src = ac.createBufferSource();
    src.buffer = this.noise;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = (hard ? 1500 : 800) + Math.random() * 300;
    const g = ac.createGain();
    g.gain.setValueAtTime(hard ? 0.09 : 0.06, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.07);
    src.connect(filter).connect(g).connect(this.master);
    src.start(ac.currentTime, Math.random() * 0.5, 0.08);
  }

  /** Text blip. Each speaker gets their own pitch. */
  blip(pitch: number): void {
    if (!this.ac) return;
    this.tone(pitch * (0.96 + Math.random() * 0.08), this.ac.currentTime, 0.05, 0.035, 'square', this.master);
  }

  select(): void {
    if (!this.ac) return;
    this.tone(660, this.ac.currentTime, 0.08, 0.05, 'triangle', this.master);
  }

  chime(): void {
    if (!this.ac) return;
    const now = this.ac.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, now + i * 0.09, 0.5, 0.07, 'triangle', this.music));
  }

  /** Filtered noise burst; `sweep` slides the filter for zips and swishes. */
  private burst(at: number, length: number, freq: number, gain: number, sweep = freq): void {
    const ac = this.ac!;
    const src = ac.createBufferSource();
    src.buffer = this.noise;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(freq, at);
    filter.frequency.linearRampToValueAtTime(sweep, at + length);
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + length);
    src.connect(filter).connect(g).connect(this.master);
    src.start(at, Math.random() * 0.5, length + 0.05);
  }

  /** Card reader accepted: two quick high beeps. */
  beep(): void {
    if (!this.ac) return;
    const now = this.ac.currentTime;
    this.tone(1760, now, 0.09, 0.05, 'square', this.master);
    this.tone(2349, now + 0.11, 0.14, 0.05, 'square', this.master);
  }

  /** Card reader refused: one low flat buzz. */
  buzz(): void {
    if (!this.ac) return;
    const now = this.ac.currentTime;
    this.tone(196, now, 0.35, 0.06, 'sawtooth', this.master);
    this.tone(207, now, 0.35, 0.04, 'square', this.master);
  }

  /** Turnstile arm unlocking and swinging round. */
  clack(): void {
    if (!this.ac) return;
    const now = this.ac.currentTime;
    this.burst(now, 0.05, 2200, 0.14);
    this.tone(110, now, 0.08, 0.08, 'triangle', this.master);
    this.burst(now + 0.32, 0.07, 1400, 0.1);
  }

  /** A zipper going one way and back. */
  zip(): void {
    if (!this.ac) return;
    const now = this.ac.currentTime;
    this.burst(now, 0.35, 1800, 0.06, 4200);
    this.burst(now + 0.45, 0.3, 4000, 0.05, 1700);
  }
}
