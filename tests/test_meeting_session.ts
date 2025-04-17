import { describe, it, expect, vi } from 'vitest';
import { MeetingSession } from '../MeetingSession';
import { DEFAULT_SETTINGS } from '../GranolaSettings';

// Mock dependencies
class MockAudioRecorder {
  settings = DEFAULT_SETTINGS;
  async startRecording() { this.micFilePath = 'mic.wav'; this.systemFilePath = 'system.wav'; }
  async stopRecording() {}
  micFilePath = '';
  systemFilePath = '';
  process: any = null;
}
class MockTranscriber {
  whisperPath = '';
  modelPath = '';
  async transcribeDualTracks() { return 'You: Hello.\nOther: Hi!'; }
  async transcribeFile() { return ''; }
}
class MockAIGenerator {
  endpoint = '';
  model = '';
  async generateSummary() { return { summary: 'Summary', actionItems: 'Action', followupEmail: 'Email' }; }
}

const mockVault = {
  files: {} as Record<string, any>,
  async create(path: string, content: string) { this.files[path] = content; },
  async read(file: any) { return this.files[file.path]; },
  async modify(file: any, content: string) { this.files[file.path] = content; },
  getAbstractFileByPath(path: string) { return { path, ...(this.files[path] ? { content: this.files[path] } : {}) }; }
};

describe('MeetingSession', () => {
  it('creates a note from template and inserts timestamped note', async () => {
    const session = new MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault } as any);
    await session.createNoteFromTemplate('Test Meeting', 'default', 'audio.wav');
    expect(session.notePath).toContain('Test_Meeting');
    await session.addTimestampedNote('Discussed project goals.');
    const content = await mockVault.read({ path: session.notePath });
    expect(content).toMatch(/Discussed project goals/);
  });

  it('handles end() and updates note with transcript and AI results', async () => {
    const session = new MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault } as any);
    await session.createNoteFromTemplate('Test Meeting', 'default', 'audio.wav');
    session.notePath = session.notePath;
    await session.end('en');
    const content = await mockVault.read({ path: session.notePath });
    expect(content).toMatch(/You:/);
    expect(content).toMatch(/Summary/);
    expect(content).toMatch(/Action/);
    expect(content).toMatch(/Email/);
  });

  it('shows error if vault or notePath missing', async () => {
    const session = new MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), null as any);
    // @ts-expect-error
    session.vault = null;
    await expect(session.createNoteFromTemplate('Test', 'default', 'audio.wav')).rejects.toThrow();
    await expect(session.addTimestampedNote('foo')).resolves.toBeUndefined();
    await expect(session.end('en')).resolves.toBeUndefined();
  });

  it('shows error if note file not found', async () => {
    const session = new MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault } as any);
    session.notePath = 'missing.md';
    await expect(session.addTimestampedNote('foo')).resolves.toBeUndefined();
    await expect(session.end('en')).resolves.toBeUndefined();
  });
});
