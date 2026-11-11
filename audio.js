// Web Audio API Sound Effects Synthesizer for PaGamO Simulator
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type = 'sine', duration = 0.15, gain = 0.2, delay = 0) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(gain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playClick() {
        this.playTone(600, 'triangle', 0.05, 0.1);
    }

    playCorrect() {
        // PaGamO uplifting major chord (C - E - G - high C)
        this.playTone(523.25, 'sine', 0.15, 0.2, 0.0);
        this.playTone(659.25, 'sine', 0.15, 0.2, 0.08);
        this.playTone(783.99, 'sine', 0.2, 0.25, 0.16);
        this.playTone(1046.50, 'triangle', 0.35, 0.3, 0.24);
    }

    playWrong() {
        // Low descending buzz
        this.playTone(220, 'sawtooth', 0.18, 0.25, 0.0);
        this.playTone(164.8, 'sawtooth', 0.3, 0.3, 0.15);
    }

    playCaptureNormal() {
        // Plop / claim sound
        this.playTone(440, 'triangle', 0.1, 0.15, 0);
        this.playTone(880, 'sine', 0.18, 0.2, 0.06);
    }

    playCaptureCastle() {
        // Epic conquest fanfare
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'triangle', 0.3, 0.25, idx * 0.08);
        });
    }

    playVictory() {
        // Grand victory melody
        const melody = [
            { f: 523.25, d: 0.15, t: 0 },
            { f: 659.25, d: 0.15, t: 0.15 },
            { f: 783.99, d: 0.2, t: 0.3 },
            { f: 1046.50, d: 0.5, t: 0.5 },
            { f: 880.00, d: 0.2, t: 0.9 },
            { f: 1046.50, d: 0.8, t: 1.1 }
        ];
        melody.forEach(n => {
            this.playTone(n.f, 'triangle', n.d, 0.3, n.t);
        });
    }

    playCountdownTick() {
        this.playTone(800, 'sine', 0.03, 0.05);
    }

    playWarning() {
        this.playTone(330, 'square', 0.1, 0.15, 0);
        this.playTone(330, 'square', 0.1, 0.15, 0.15);
    }
}

window.soundManager = new SoundManager();

