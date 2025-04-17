import { MeetingSession } from '../MeetingSession';
import { AudioRecorder } from '../AudioRecorder';
import { Transcriber } from '../Transcriber';
import { AIGenerator } from '../AIGenerator';
import { TFile } from 'obsidian';

describe('MeetingSession', () => {
  let audioRecorder: AudioRecorder;
  let transcriber: Transcriber;
  let aiGenerator: AIGenerator;
  let session: MeetingSession;

  beforeEach(() => {
    audioRecorder = {
      startRecording: jest.fn().mockResolvedValue(undefined),
      stopRecording: jest.fn().mockResolvedValue(undefined),
      micFilePath: '/tmp/test_mic.wav',
      systemFilePath: '/tmp/test_system.wav',
    } as any;
    transcriber = {
      transcribeDualTracks: jest.fn().mockResolvedValue('test transcript'),
    } as any;
    aiGenerator = {
      generateSummary: jest.fn().mockResolvedValue({ summary: 'sum', actionItems: 'a', followupEmail: 'f' }),
    } as any;
    session = new MeetingSession(audioRecorder, transcriber, aiGenerator);
  });

  it('should call startRecording and set file paths', async () => {
    await session.start('Test Meeting', '', 'mic', 'sys', '/tmp/test');
    expect(audioRecorder.startRecording).toHaveBeenCalled();
    expect(session.audioFilePath).toBe('/tmp/test_mic.wav');
    expect(session.systemFilePath).toBe('/tmp/test_system.wav');
  });

  it('should call stopRecording and update note on end', async () => {
    // Return a real TFile mock so instanceof works
    const mockFile = new TFile();
    mockFile.name = 'note.md';
    session.vault = {
      getAbstractFileByPath: jest.fn().mockReturnValue(mockFile),
      read: jest.fn().mockResolvedValue('# Notes\n'),
      modify: jest.fn().mockResolvedValue(undefined),
    } as any;
    session.notePath = 'note.md';
    await session.end('en');
    expect(audioRecorder.stopRecording).toHaveBeenCalled();
    expect(transcriber.transcribeDualTracks).toHaveBeenCalled();
    expect(aiGenerator.generateSummary).toHaveBeenCalled();
  });

  it('should handle missing vault or notePath on end gracefully', async () => {
    session.vault = undefined;
    session.notePath = '';
    await expect(session.end('en')).resolves.toBeUndefined();
  });
});
