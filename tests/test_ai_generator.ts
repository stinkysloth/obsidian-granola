import { describe, it, expect, vi } from 'vitest';
import { AIGenerator } from '../AIGenerator';

describe('AIGenerator', () => {
  it('generates summary and action items', async () => {
    const ai = new AIGenerator('http://localhost:11434', 'mistral');
    vi.spyOn(ai, 'generateSummary').mockResolvedValue({
      summary: 'Summary',
      actionItems: 'Action',
      followupEmail: 'Email',
    });
    const result = await ai.generateSummary('notes', 'transcript');
    expect(result.summary).toBe('Summary');
    expect(result.actionItems).toBe('Action');
    expect(result.followupEmail).toBe('Email');
  });

  it('handles API errors', async () => {
    const ai = new AIGenerator('http://localhost:11434', 'mistral');
    vi.spyOn(ai, 'generateSummary').mockRejectedValue(new Error('API error'));
    await expect(ai.generateSummary('notes', 'transcript')).rejects.toThrow('API error');
  });
});
