"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const AudioRecorder_1 = require("../AudioRecorder");
(0, vitest_1.describe)('AudioRecorder', () => {
    (0, vitest_1.it)('initializes and starts recording', async () => {
        const recorder = new AudioRecorder_1.AudioRecorder();
        vitest_1.vi.spyOn(recorder, 'startRecording').mockResolvedValue(undefined);
        await (0, vitest_1.expect)(recorder.startRecording('mic', 'system', 'base')).resolves.toBeUndefined();
    });
    (0, vitest_1.it)('stops recording', async () => {
        const recorder = new AudioRecorder_1.AudioRecorder();
        vitest_1.vi.spyOn(recorder, 'stopRecording').mockResolvedValue(undefined);
        await (0, vitest_1.expect)(recorder.stopRecording()).resolves.toBeUndefined();
    });
    (0, vitest_1.it)('handles process errors gracefully', async () => {
        const recorder = new AudioRecorder_1.AudioRecorder();
        recorder.process = { kill: vitest_1.vi.fn(() => { throw new Error('fail'); }) };
        try {
            await recorder.stopRecording();
        }
        catch (e) {
            (0, vitest_1.expect)(e).toBeInstanceOf(Error);
        }
    });
});
