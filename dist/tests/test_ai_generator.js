"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const AIGenerator_1 = require("../AIGenerator");
(0, vitest_1.describe)('AIGenerator', () => {
    (0, vitest_1.it)('generates summary and action items', async () => {
        const ai = new AIGenerator_1.AIGenerator('http://localhost:11434', 'mistral');
        vitest_1.vi.spyOn(ai, 'generateSummary').mockResolvedValue({
            summary: 'Summary',
            actionItems: 'Action',
            followupEmail: 'Email',
        });
        const result = await ai.generateSummary('notes', 'transcript');
        (0, vitest_1.expect)(result.summary).toBe('Summary');
        (0, vitest_1.expect)(result.actionItems).toBe('Action');
        (0, vitest_1.expect)(result.followupEmail).toBe('Email');
    });
    (0, vitest_1.it)('handles API errors', async () => {
        const ai = new AIGenerator_1.AIGenerator('http://localhost:11434', 'mistral');
        vitest_1.vi.spyOn(ai, 'generateSummary').mockRejectedValue(new Error('API error'));
        await (0, vitest_1.expect)(ai.generateSummary('notes', 'transcript')).rejects.toThrow('API error');
    });
});
