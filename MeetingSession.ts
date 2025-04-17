import { AudioRecorder } from './AudioRecorder';
import { Transcriber } from './Transcriber';
import { AIGenerator } from './AIGenerator';
import { App, TFile, TFolder, normalizePath, Vault, Notice, TAbstractFile } from 'obsidian';
import { GranolaSettings, DEFAULT_SETTINGS } from './GranolaSettings';

/**
 * Manages the lifecycle of a meeting session: note creation, audio, timestamps, transcription, and AI summary.
 */
export class MeetingSession {
  /** Title of the meeting session. */
  title: string;
  /** Path to the audio file for this session. */
  audioFilePath: string;
  /** Path to the system audio file for this session (if dual-track). */
  systemFilePath: string;
  /** Path to the session note. */
  notePath: string;
  /** Timestamp when session started. */
  startTime: number;

  // Core modules
  audioRecorder: AudioRecorder;
  transcriber: Transcriber;
  aiGenerator: AIGenerator;

  // Obsidian context
  app?: App;
  vault?: Vault;
  settings: GranolaSettings;

  constructor(audioRecorder: AudioRecorder, transcriber: Transcriber, aiGenerator: AIGenerator, app?: App, settings?: GranolaSettings) {
    this.title = '';
    this.audioFilePath = '';
    this.systemFilePath = '';
    this.notePath = '';
    this.startTime = Date.now();
    this.audioRecorder = audioRecorder;
    this.transcriber = transcriber;
    this.aiGenerator = aiGenerator;
    this.app = app;
    this.vault = app?.vault;
    this.settings = settings || DEFAULT_SETTINGS;
  }

  /**
   * Create a new note from a template, replacing variables.
   */
  async createNoteFromTemplate(title: string, template: string, audioPath: string): Promise<string> {
    if (!this.app || !this.vault) {
      new Notice('Granola: Obsidian app context required to create note.');
      throw new Error('Obsidian app context required');
    }
    const templatesFolder = this.settings.templateFolder || 'granola-templates';
    let templateContent = '';
    try {
      const folder = this.vault.getAbstractFileByPath(templatesFolder);
      if (folder && folder instanceof TFolder) {
        const file = folder.children.find((f: TAbstractFile) => f instanceof TFile && f.name === `${template}.md`);
        if (file && file instanceof TFile) {
          templateContent = await this.vault.read(file);
        }
      }
      if (!templateContent) {
        templateContent = '# {{title}}\n\n## Notes\n\n## Transcript\n\n## Summary (AI)\n\n## Action Items\n\n## Follow-up Email\n';
        new Notice(`Granola: Template '${template}' not found. Using default.`);
      }
    } catch (e) {
      templateContent = '# {{title}}\n\n## Notes\n\n## Transcript\n\n## Summary (AI)\n\n## Action Items\n\n## Follow-up Email\n';
      new Notice(`Granola: Error loading template. Using default.`);
    }
    // Replace variables
    const dateStr = (window as any).moment
      ? (window as any).moment(this.startTime).format('YYYY-MM-DD HH:mm')
      : new Date(this.startTime).toISOString();
    const noteContent = templateContent
      .replace(/{{title}}/g, title)
      .replace(/{{date}}/g, dateStr)
      .replace(/{{audio_file_path}}/g, audioPath);
    // Create note file
    const notePath = `Granola Meetings/${dateStr.replace(/[: ]/g, '-')}_${title.replace(/\s+/g, '_')}.md`;
    const normalizedPath = normalizePath(notePath);
    try {
      await this.vault.create(normalizedPath, noteContent);
    } catch (e) {
      new Notice(`Granola: Failed to create note at ${normalizedPath}`);
      throw e;
    }
    this.notePath = normalizedPath;
    return normalizedPath;
  }

  /**
   * Add a timestamped note to the session note under the ## Notes section.
   */
  async addTimestampedNote(text: string): Promise<void> {
    if (!this.vault || !this.notePath) {
      new Notice('Granola: Cannot add note, vault or note path missing.');
      return;
    }
    const file = this.vault.getAbstractFileByPath(this.notePath);
    if (!file || !(file instanceof TFile)) {
      new Notice('Granola: Session note file not found.');
      return;
    }
    // Optionally auto-insert timestamp
    let noteLine = text;
    if (this.settings.autoInsertTimestamp) {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const ss = String(elapsed % 60).padStart(2, '0');
      const timestamp = `[${hh}:${mm}:${ss}]`;
      noteLine = `${timestamp} ${text}`;
    }
    let content = await this.vault.read(file);
    const notesSection = content.match(/^## Notes[\s\S]*?(?=^## |---|$)/m);
    if (notesSection) {
      const idx = content.indexOf(notesSection[0]) + notesSection[0].length;
      content = content.slice(0, idx) + `\n${noteLine}` + content.slice(idx);
    } else {
      // Fallback: append at end
      content += `\n\n${noteLine}`;
      new Notice('Granola: ## Notes section not found, appending note at end.');
    }
    await this.vault.modify(file, content);
  }

  /**
   * Start a new meeting session: create note, start audio recording.
   */
  async start(title: string, template: string, micDevice: string, systemDevice: string, basePath: string) {
    this.title = title;
    // Start dual-track audio recording if enabled
    try {
      await this.audioRecorder.startRecording(
        micDevice,
        this.settings.enableDualTrack ? systemDevice : '',
        basePath
      );
    } catch (e) {
      new Notice('Granola: Error starting audio recording.');
    }
    this.audioFilePath = this.audioRecorder.micFilePath;
    this.systemFilePath = this.audioRecorder.systemFilePath;
    // Create note from template
    if (this.app) {
      try {
        await this.createNoteFromTemplate(title, template, this.audioFilePath);
      } catch (e) {
        new Notice('Granola: Error creating note from template.');
      }
    }
    // TODO: Show status bar indicator if enabled
  }

  /**
   * End the meeting session: stop audio, transcribe, generate AI summary, and update the note.
   */
  async end(language: string): Promise<void> {
    if (!this.vault || !this.notePath) {
      new Notice('Granola: Cannot end session, vault or note path missing.');
      return;
    }
    const file = this.vault.getAbstractFileByPath(this.notePath);
    if (!file || !(file instanceof TFile)) {
      new Notice('Granola: Session note file not found.');
      return;
    }
    try {
      // Stop audio recording
      await this.audioRecorder.stopRecording();
    } catch (e) {
      new Notice('Granola: Error stopping audio recording.');
    }
    let transcript = '';
    if (this.settings.autoTranscribeOnEnd) {
      try {
        // Transcribe both tracks and merge
        transcript = await this.transcriber.transcribeDualTracks(this.audioFilePath, this.systemFilePath, this.settings.whisperLanguage || language);
      } catch (e) {
        new Notice('Granola: Error during transcription.');
      }
    }
    let aiResults = { summary: '', actionItems: '', followupEmail: '' };
    try {
      // For now, extract notes section as empty string (TODO: parse notes from file)
      const notes = '';
      aiResults = await this.aiGenerator.generateSummary(notes, transcript);
    } catch (e) {
      new Notice('Granola: Error generating AI summary.');
    }
    // Read note, insert transcript and AI results into appropriate sections
    let content = await this.vault.read(file);
    content = this._replaceSection(content, 'Transcript', transcript);
    content = this._replaceSection(content, 'Summary (AI)', aiResults.summary);
    content = this._replaceSection(content, 'Action Items', aiResults.actionItems);
    content = this._replaceSection(content, 'Follow-up Email', aiResults.followupEmail);
    await this.vault.modify(file, content);
    new Notice('Granola: Meeting session ended and note updated.');
  }

  /**
   * Replace the content under a given markdown section header.
   */
  private _replaceSection(content: string, section: string, newText: string): string {
    const regex = new RegExp(`(^## ${section}\\s*$)([\\s\\S]*?)(?=^## |---|$)`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `$1\n${newText}\n`);
    } else {
      // If section not found, append at end
      return content + `\n\n## ${section}\n${newText}\n`;
    }
  }
}
