"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Transcriber_1 = require("../Transcriber");
(0, vitest_1.describe)('Transcriber', () => {
    (0, vitest_1.it)('transcribes dual tracks', async () => {
        const transcriber = new Transcriber_1.Transcriber('whisper.cpp', 'model.bin');
        vitest_1.vi.spyOn(transcriber, 'transcribeDualTracks').mockResolvedValue('You: Hello.\nOther: Hi!');
        const result = await transcriber.transcribeDualTracks('mic.wav', 'system.wav', 'en');
        (0, vitest_1.expect)(result).toMatch(/You:/);
    });
    (0, vitest_1.it)('handles missing files', async () => {
        const transcriber = new Transcriber_1.Transcriber('whisper.cpp', 'model.bin');
        vitest_1.vi.spyOn(transcriber, 'transcribeDualTracks').mockRejectedValue(new Error('File not found'));
        await (0, vitest_1.expect)(transcriber.transcribeDualTracks('', '', 'en')).rejects.toThrow('File not found');
    });
});
