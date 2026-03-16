class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Play a tone with specific frequency and duration
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  move() {
    this.playTone(400, 0.1, 'sine');
  }

  merge() {
    this.playTone(600, 0.15, 'triangle');
    setTimeout(() => this.playTone(800, 0.1, 'triangle'), 50);
  }

  spawn() {
    this.playTone(300, 0.1, 'sine');
  }

  gameOver() {
    this.playTone(400, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.2, 'sawtooth'), 150);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth'), 300);
  }

  win() {
    this.playTone(523, 0.15, 'sine');
    setTimeout(() => this.playTone(659, 0.15, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
    setTimeout(() => this.playTone(1047, 0.3, 'sine'), 300);
  }

  bigMerge() {
    this.playTone(800, 0.2, 'square');
    setTimeout(() => this.playTone(1000, 0.2, 'square'), 80);
    setTimeout(() => this.playTone(1200, 0.25, 'square'), 160);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

export default new SoundEffects();