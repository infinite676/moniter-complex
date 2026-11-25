/**
 * Monitor Complex - Futuristic Sound Engine
 * Synthesizes sci-fi micro-interactions using native Web Audio API.
 * Zero external audio files required. User-toggleable and persisted.
 */

const SoundEngine = (function() {
    let audioCtx = null;
    let isMuted = localStorage.getItem('mc_audio_muted') === 'true';

    function initCtx() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, gainLevel, decay = true) {
        if (isMuted) return;
        try {
            initCtx();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(gainLevel || 0.05, audioCtx.currentTime);
            if (decay) {
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            }

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context not allowed or unsupported
        }
    }

    return {
        isMuted: () => isMuted,
        toggleMute: function() {
            isMuted = !isMuted;
            localStorage.setItem('mc_audio_muted', isMuted);
            if (!isMuted) {
                this.click();
            }
            return isMuted;
        },
        click: function() {
            playTone(880, 'sine', 0.06, 0.04);
        },
        tabSwitch: function() {
            playTone(520, 'sine', 0.05, 0.03);
            setTimeout(() => playTone(780, 'sine', 0.08, 0.03), 40);
        },
        success: function() {
            playTone(587.33, 'triangle', 0.12, 0.05); // D5
            setTimeout(() => playTone(880, 'triangle', 0.18, 0.05), 100); // A5
            setTimeout(() => playTone(1174.66, 'sine', 0.25, 0.06), 200); // D6
        },
        pingPulse: function() {
            playTone(1200, 'sine', 0.04, 0.02);
        },
        speedSweep: function(speedRatio) {
            // dynamic sweep tone based on current speed
            if (isMuted) return;
            try {
                initCtx();
                if (!audioCtx) return;
                const freq = 200 + Math.min(speedRatio * 1200, 1500);
                playTone(freq, 'sine', 0.04, 0.015);
            } catch (e) {}
        },
        error: function() {
            playTone(220, 'sawtooth', 0.15, 0.04);
            setTimeout(() => playTone(180, 'sawtooth', 0.2, 0.04), 100);
        }
    };
})();

window.SoundEngine = SoundEngine;
