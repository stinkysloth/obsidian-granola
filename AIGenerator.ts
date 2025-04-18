import { GranolaSettings } from './GranolaSettings';

/**
 * Handles prompt generation and LLM API calls for summarization, action items, and follow-up email.
 * Supports local LLM (Ollama) and optional OpenAI fallback.
 */
export class AIGenerator {
  /**
   * Endpoint for LLM API (e.g., Ollama or OpenAI).
   */
  endpoint: string;
  /**
   * Model name (e.g., 'mistral', 'llama2', etc.).
   */
  model: string;
  /**
   * Optional fallback endpoint for LLM API.
   */
  fallbackEndpoint?: string;
  /**
   * Optional fallback model name.
   */
  fallbackModel?: string;

  constructor(endpoint: string, model: string, fallbackEndpoint?: string, fallbackModel?: string) {
    this.endpoint = endpoint;
    this.model = model;
    this.fallbackEndpoint = fallbackEndpoint;
    this.fallbackModel = fallbackModel;
    console.log('[Granola] AIGenerator constructed', { endpoint, model, fallbackEndpoint, fallbackModel });
  }

  /**
   * Generate AI summary, action items, and follow-up email from notes and transcript.
   *
   * Args:
   *   notes (string): Meeting notes.
   *   transcript (string): Full transcript text.
   *
   * Returns:
   *   Promise<{ summary: string; actionItems: string; followupEmail: string; }>
   */
  async generateSummary(notes: string, transcript: string): Promise<{ summary: string; actionItems: string; followupEmail: string; }> {
    // Improved prompt for better reliability and explicit JSON output
    const prompt = `You are an expert meeting assistant.\n\nYour task is to analyze the provided meeting notes and transcript, then respond ONLY with a valid JSON object containing the following keys: summary, actionItems, followupEmail.\n\nRequirements:\n- summary: A concise summary of the meeting.\n- actionItems: A bullet list of actionable tasks.\n- followupEmail: A draft follow-up email to send to participants.\n\nIf you are unsure, return empty strings for any field.\n\nMeeting Notes:\n${notes}\n\nTranscript:\n${transcript}\n\nRespond ONLY with a JSON object, no explanations or extra text.`;

    // Helper to call an endpoint
    const callLLM = async (endpoint: string, model: string) => {
      console.log('[Granola] Calling LLM API:', endpoint);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false })
      });
      if (!res.ok) {
        console.error('[Granola] LLM API error:', res.status, endpoint);
        throw new Error(`LLM API error: ${res.status}`);
      }
      const data = await res.json();
      let parsed;
      try {
        parsed = JSON.parse(data.response);
      } catch (e) {
        // Try to extract JSON substring
        const match = data.response.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else {
          console.error('[Granola] Could not parse LLM response as JSON:', data.response);
          throw new Error('Could not parse LLM response as JSON');
        }
      }
      return {
        summary: parsed.summary || '',
        actionItems: parsed.actionItems || '',
        followupEmail: parsed.followupEmail || ''
      };
    };

    // Try primary endpoint, then fallback if configured
    try {
      const result = await callLLM(this.endpoint, this.model);
      console.log('[Granola] LLM summary generated successfully');
      return result;
    } catch (err) {
      console.error('[Granola] Primary LLM failed:', err);
      if (this.fallbackEndpoint && this.fallbackModel) {
        try {
          const fallbackResult = await callLLM(this.fallbackEndpoint, this.fallbackModel);
          console.log('[Granola] Fallback LLM summary generated successfully');
          return fallbackResult;
        } catch (fallbackErr) {
          console.error('[Granola] Fallback LLM also failed:', fallbackErr);
        }
      }
      // If all fail, return empty
      console.log('[Granola] All LLM attempts failed, returning empty summary');
      return { summary: '', actionItems: '', followupEmail: '' };
    }
  }
}
