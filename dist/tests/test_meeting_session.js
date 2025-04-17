"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const MeetingSession_1 = require("../MeetingSession");
const GranolaSettings_1 = require("../GranolaSettings");
// Mock dependencies
class MockAudioRecorder {
    constructor() {
        this.settings = GranolaSettings_1.DEFAULT_SETTINGS;
        this.micFilePath = '';
        this.systemFilePath = '';
        this.process = null;
    }
    async startRecording() { this.micFilePath = 'mic.wav'; this.systemFilePath = 'system.wav'; }
    async stopRecording() { }
}
class MockTranscriber {
    constructor() {
        this.whisperPath = '';
        this.modelPath = '';
    }
    async transcribeDualTracks() { return 'You: Hello.\nOther: Hi!'; }
    async transcribeFile() { return ''; }
}
class MockAIGenerator {
    constructor() {
        this.endpoint = '';
        this.model = '';
    }
    async generateSummary() { return { summary: 'Summary', actionItems: 'Action', followupEmail: 'Email' }; }
}
const mockVault = {
    files: {},
    async create(path, content) { this.files[path] = content; },
    async read(file) { return this.files[file.path]; },
    async modify(file, content) { this.files[file.path] = content; },
    getAbstractFileByPath(path) { return { path, ...(this.files[path] ? { content: this.files[path] } : {}) }; }
};
(0, vitest_1.describe)('MeetingSession', () => {
    (0, vitest_1.it)('creates a note from template and inserts timestamped note', async () => {
        const session = new MeetingSession_1.MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault });
        await session.createNoteFromTemplate('Test Meeting', 'default', 'audio.wav');
        (0, vitest_1.expect)(session.notePath).toContain('Test_Meeting');
        await session.addTimestampedNote('Discussed project goals.');
        const content = await mockVault.read({ path: session.notePath });
        (0, vitest_1.expect)(content).toMatch(/Discussed project goals/);
    });
    (0, vitest_1.it)('handles end() and updates note with transcript and AI results', async () => {
        const session = new MeetingSession_1.MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault });
        await session.createNoteFromTemplate('Test Meeting', 'default', 'audio.wav');
        session.notePath = session.notePath;
        await session.end('en');
        const content = await mockVault.read({ path: session.notePath });
        (0, vitest_1.expect)(content).toMatch(/You:/);
        (0, vitest_1.expect)(content).toMatch(/Summary/);
        (0, vitest_1.expect)(content).toMatch(/Action/);
        (0, vitest_1.expect)(content).toMatch(/Email/);
    });
    (0, vitest_1.it)('shows error if vault or notePath missing', async () => {
        const session = new MeetingSession_1.MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), null);
        // @ts-expect-error
        session.vault = null;
        await (0, vitest_1.expect)(session.createNoteFromTemplate('Test', 'default', 'audio.wav')).rejects.toThrow();
        await (0, vitest_1.expect)(session.addTimestampedNote('foo')).resolves.toBeUndefined();
        await (0, vitest_1.expect)(session.end('en')).resolves.toBeUndefined();
    });
    (0, vitest_1.it)('shows error if note file not found', async () => {
        const session = new MeetingSession_1.MeetingSession(new MockAudioRecorder(), new MockTranscriber(), new MockAIGenerator(), { vault: mockVault });
        session.notePath = 'missing.md';
        await (0, vitest_1.expect)(session.addTimestampedNote('foo')).resolves.toBeUndefined();
        await (0, vitest_1.expect)(session.end('en')).resolves.toBeUndefined();
    });
});
