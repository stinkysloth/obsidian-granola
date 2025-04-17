import { exec, spawn, ChildProcess } from 'child_process';
import { GranolaSettings, DEFAULT_SETTINGS } from './GranolaSettings';

/**
 * Handles audio capture (mic/system) and saving to file.
 * On macOS, supports dual-track recording (mic + system audio) via ffmpeg and a virtual audio device (e.g., BlackHole).
 */
export class AudioRecorder {
  /** Path to mic audio file. */
  micFilePath: string;
  /** Path to system audio file. */
  systemFilePath: string;
  /** ffmpeg process instance. */
  process: ChildProcess | null;
  /** Plugin settings. */
  settings: GranolaSettings;

  constructor(settings?: GranolaSettings) {
    this.micFilePath = '';
    this.systemFilePath = '';
    this.process = null;
    this.settings = settings || DEFAULT_SETTINGS;
    console.log('[Granola] AudioRecorder constructed', { settings: this.settings });
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
  async startRecording(micDevice: string, systemDevice: string, basePath: string) {
    this.micFilePath = `${basePath}_mic.wav`;
    this.systemFilePath = `${basePath}_system.wav`;
    console.log('[Granola] startRecording called', { micDevice, systemDevice, basePath });
    // Ensure output directory exists
    const fs = require('fs');
    const path = require('path');
    const outDir = path.dirname(this.micFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
      console.log('[Granola] Created audio output directory:', outDir);
    }
    // Build ffmpeg command
    if (this.settings.enableDualTrack && systemDevice) {
      // Dual-track: record mic and system audio separately
      const ffmpegArgs = [
        '-y',
        '-f', 'avfoundation',
        '-i', `${micDevice}:none`,
        '-f', 'avfoundation',
        '-i', `none:${systemDevice}`,
        '-map', '0:a', this.micFilePath,
        '-map', '1:a', this.systemFilePath
      ];
      console.log('[Granola] Starting dual-track ffmpeg:', 'ffmpeg', ffmpegArgs.join(' '));
      this.process = spawn('ffmpeg', ffmpegArgs);
    } else {
      // Single-track: record only mic
      const ffmpegArgs = [
        '-y',
        '-f', 'avfoundation',
        '-i', micDevice,
        this.micFilePath
      ];
      console.log('[Granola] Starting single-track ffmpeg:', 'ffmpeg', ffmpegArgs.join(' '));
      this.process = spawn('ffmpeg', ffmpegArgs);
    }
    // Log ffmpeg output for debugging
    if (this.process) {
      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          console.log(`[Granola] ffmpeg stdout: ${data}`);
        });
      }
      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          console.log(`[Granola] ffmpeg stderr: ${data}`);
        });
      }
      this.process.on('error', (err: Error) => {
        console.error('[Granola] ffmpeg process error:', err);
      });
      this.process.on('exit', (code: number, signal: string) => {
        console.log(`[Granola] ffmpeg exited with code ${code}, signal ${signal}`);
      });
    } else {
      throw new Error('Failed to start ffmpeg process');
    }
  }

  /**
   * Stop recording audio.
   */
  async stopRecording() {
    if (this.process) {
      this.process.kill('SIGINT');
      console.log('[Granola] stopRecording called, ffmpeg process killed');
      this.process = null;
    } else {
      console.warn('[Granola] stopRecording called, but no ffmpeg process was running');
    }
  }
}
