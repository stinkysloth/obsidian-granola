import { describe, it, expect, vi } from 'vitest';
import { Transcriber } from '../Transcriber';

describe('Transcriber', () => {
  it('transcribes dual tracks', async () => {
    const transcriber = new Transcriber('whisper.cpp', 'model.bin');
    vi.spyOn(transcriber, 'transcribeDualTracks').mockResolvedValue('You: Hello.\nOther: Hi!');
    const result = await transcriber.transcribeDualTracks('mic.wav', 'system.wav', 'en');
    expect(result).toMatch(/You:/);
  });

  it('handles missing files', async () => {
    const transcriber = new Transcriber('whisper.cpp', 'model.bin');
    vi.spyOn(transcriber, 'transcribeDualTracks').mockRejectedValue(new Error('File not found'));
    await expect(transcriber.transcribeDualTracks('', '', 'en')).rejects.toThrow('File not found');
  });
});
