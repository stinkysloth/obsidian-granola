"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioRecorder = void 0;
const GranolaSettings_1 = require("./GranolaSettings");
/**
 * Handles audio capture (mic/system) and saving to file.
 * On macOS, supports dual-track recording (mic + system audio) via ffmpeg and a virtual audio device (e.g., BlackHole).
 */
class AudioRecorder {
    constructor(settings) {
        this.micFilePath = '';
        this.systemFilePath = '';
        this.process = null;
        this.settings = settings || GranolaSettings_1.DEFAULT_SETTINGS;
    }
    /**
     * Start recording mic and (optionally) system audio to separate files (macOS only).
     * Uses settings.enableDualTrack to determine if system audio is recorded.
     *
     * Args:
     *   micDevice (string): Name of mic input device (e.g., 'MacBook Pro Microphone').
     *   systemDevice (string): Name of system audio device (e.g., 'BlackHole 2ch').
     *   basePath (string): Base path for output files.
     */
    async startRecording(micDevice, systemDevice, basePath) {
        this.micFilePath = `${basePath}_mic.wav`;
        this.systemFilePath = `${basePath}_system.wav`;
        // If dual-track is enabled, record both mic and system audio
        if (this.settings.enableDualTrack && systemDevice) {
            // TODO: Implement dual-track ffmpeg command using micDevice and systemDevice
            // Example placeholder:
            // this.process = exec(`ffmpeg -f avfoundation -i \\"${micDevice}:none\\" -f avfoundation -i \\"none:${systemDevice}\\" -filter_complex "[0:a][1:a]amerge=inputs=2[aout]" -map "[aout]" ${basePath}_merged.wav`);
        }
        else {
            // Only record mic
            // TODO: Implement single-track ffmpeg command
            // this.process = exec(`ffmpeg -f avfoundation -i \\"${micDevice}\\" ${this.micFilePath}`);
        }
        // See README for setup instructions
    }
    /**
     * Stop recording audio.
     */
    async stopRecording() {
        // TODO: Stop ffmpeg process and finalize files
        // if (this.process) this.process.kill();
    }
}
exports.AudioRecorder = AudioRecorder;
