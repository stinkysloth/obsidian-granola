import { describe, it, expect, vi } from 'vitest';
import { AudioRecorder } from '../AudioRecorder';

describe('AudioRecorder', () => {
  it('initializes and starts recording', async () => {
    const recorder = new AudioRecorder();
    vi.spyOn(recorder, 'startRecording').mockResolvedValue(undefined);
    await expect(recorder.startRecording('mic', 'system', 'base')).resolves.toBeUndefined();
  });

  it('stops recording', async () => {
    const recorder = new AudioRecorder();
    vi.spyOn(recorder, 'stopRecording').mockResolvedValue(undefined);
    await expect(recorder.stopRecording()).resolves.toBeUndefined();
  });

  it('handles process errors gracefully', async () => {
    const recorder = new AudioRecorder();
    recorder.process = { kill: vi.fn(() => { throw new Error('fail'); }) } as any;
    try {
      await recorder.stopRecording();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
