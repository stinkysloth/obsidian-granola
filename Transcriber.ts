import { exec } from 'child_process';
import { GranolaSettings } from './GranolaSettings';

/**
 * Wraps Whisper.cpp execution and parsing for transcription.
 * Supports dual-track (mic + system) transcription and merges results with speaker labels.
 */
export class Transcriber {
  /**
   * Path to Whisper.cpp binary.
   */
  whisperPath: string;
  /**
   * Path to model file.
   */
  modelPath: string;

  constructor(whisperPath: string, modelPath: string) {
    this.whisperPath = whisperPath;
    this.modelPath = modelPath;
  }

  /**
   * Transcribe a single audio file using Whisper.cpp.
   *
   * Args:
   *   audioPath (string): Path to .wav file.
   *   language (string): Language code (e.g., 'en').
   *   outputPath (string): Path to save transcript.
   *
   * Returns:
   *   Promise<string>: Transcript text.
   */
  async transcribeFile(audioPath: string, language: string, outputPath: string): Promise<string> {
    // TODO: Run Whisper.cpp as a child process
    // Example: ./main -m models/ggml-base.en.bin -f path/to/audio.wav -otxt -of output.txt
    // TODO: Parse and return transcript
    return '';
  }

  /**
   * Transcribe both mic and system audio, merge with speaker labels.
   *
   * Args:
   *   micPath (string): Path to mic audio file.
   *   systemPath (string): Path to system audio file.
   *   language (string): Language code.
   *
   * Returns:
   *   Promise<string>: Merged transcript with speaker labels.
   */
  async transcribeDualTracks(micPath: string, systemPath: string, language: string): Promise<string> {
    // Transcribe each track
    const micTranscript = await this.transcribeFile(micPath, language, micPath + '.txt');
    const systemTranscript = await this.transcribeFile(systemPath, language, systemPath + '.txt');
    // TODO: Merge transcripts, label as 'You:' (mic) and 'Other:' (system)
    // TODO: Align by timestamps if possible, or interleave based on timing
    return `You:\n${micTranscript}\nOther:\n${systemTranscript}`;
  }
}
