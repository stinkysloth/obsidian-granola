import { AudioRecorder } from '../AudioRecorder';
import { GranolaSettings, DEFAULT_SETTINGS } from '../GranolaSettings';
import * as fs from 'fs';

jest.mock('child_process', () => {
  const events = require('events');
  return {
    spawn: jest.fn(() => {
      const proc = new events.EventEmitter();
      proc.stdout = new events.EventEmitter();
      proc.stderr = new events.EventEmitter();
      proc.kill = jest.fn();
      return proc;
    }),
    exec: jest.fn(),
    ChildProcess: function () {}
  };
});

describe('AudioRecorder', () => {
  const testSettings: GranolaSettings = {
    ...DEFAULT_SETTINGS,
    enableDualTrack: false
  };
  let recorder: AudioRecorder;

  beforeEach(() => {
    recorder = new AudioRecorder(testSettings);
  });

  it('should construct with default settings', () => {
    expect(recorder.micFilePath).toBe('');
    expect(recorder.systemFilePath).toBe('');
    expect(recorder.process).toBeNull();
  });

  it('should throw if ffmpeg fails to start', async () => {
    // Simulate spawn returning null
    const { spawn } = require('child_process');
    spawn.mockImplementationOnce(() => null);
    await expect(recorder.startRecording('invalid-device', '', '/tmp/testpath')).rejects.toThrow();
  });

  it('should handle stopRecording gracefully if not started', async () => {
    await expect(recorder.stopRecording()).resolves.toBeUndefined();
  });

  // Edge case: output directory does not exist
  it('should create output directory if missing', async () => {
    const basePath = '/tmp/granola-test-audio/testfile';
    const dir = '/tmp/granola-test-audio';
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
    try {
      await recorder.startRecording('invalid-device', '', basePath);
    } catch {}
    expect(fs.existsSync(dir)).toBe(true);
    fs.rmSync(dir, { recursive: true });
  });
});
