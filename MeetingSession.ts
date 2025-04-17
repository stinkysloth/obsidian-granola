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
    console.log('[Granola] MeetingSession constructed', { hasApp: !!app, settings: this.settings });
  }

  /**
   * Create a new note from a template, replacing variables.
   *
   * If the template is not set, not found, or empty, creates a minimal default note.
   *
   * Args:
   *   title (string): Meeting title.
   *   template (string): Template name (optional).
   *   audioPath (string): Path to meeting audio file.
   *
   * Returns:
   *   Promise<string>: Path to the created note.
   */
  async createNoteFromTemplate(title: string, template: string, audioPath: string): Promise<string> {
    if (!this.app || !this.vault) {
      new Notice('Granola: Obsidian app context required to create note.');
      console.error('[Granola] Cannot create note: missing app or vault context');
      throw new Error('Obsidian app context required');
    }
    const templatesFolder = this.settings.templateFolder || 'granola-templates';
    let templateContent = '';
    let usedTemplate = false;
    // Try to load template if provided and non-empty
    if (template && template.trim() !== '') {
      try {
        const folder = this.vault.getAbstractFileByPath(templatesFolder);
        if (folder && folder instanceof TFolder) {
          const file = folder.children.find((f: TAbstractFile) => f instanceof TFile && f.name === `${template}.md`);
          if (file && file instanceof TFile) {
            templateContent = await this.vault.read(file);
            usedTemplate = true;
            console.log('[Granola] Loaded template:', template);
          }
        }
        if (!templateContent) {
          new Notice(`Granola: Template '${template}' not found or empty. Using default note structure.`);
          console.warn(`[Granola] Template '${template}' not found or empty. Using default.`);
        }
      } catch (e) {
        new Notice(`Granola: Error loading template. Using default note structure.`);
        console.error('[Granola] Error loading template:', e);
      }
    }
    // Fallback to minimal structure if no template used
    if (!usedTemplate || !templateContent) {
      templateContent = `# ${title}\n\n- Date: {{date}}\n- Audio: {{audio_file_path}}\n\n## Notes\n\n## Transcript\n\n## Summary (AI)\n\n## Action Items\n\n## Follow-up Email\n`;
      console.log('[Granola] Using default note structure');
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
    const parentFolderPath = normalizedPath.split('/').slice(0, -1).join('/');
    try {
      // Ensure parent folder exists
      let folder = this.vault.getAbstractFileByPath(parentFolderPath);
      if (!folder) {
        console.log('[Granola] Parent folder does not exist, creating:', parentFolderPath);
        await this.vault.createFolder(parentFolderPath);
      }
      await this.vault.create(normalizedPath, noteContent);
      console.log('[Granola] Note created at', normalizedPath);
    } catch (e) {
      new Notice(`Granola: Failed to create note at ${normalizedPath}`);
      console.error('[Granola] Failed to create note:', e, 'Path:', normalizedPath, 'Parent:', parentFolderPath);
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
      new Notice('Granola: Cannot add note, missing vault or note path.');
      console.error('[Granola] Cannot add timestamped note: missing vault or notePath');
      return;
    }
    const file = this.vault.getAbstractFileByPath(this.notePath);
    if (!file || !(file instanceof TFile)) {
      new Notice('Granola: Session note file not found.');
      console.error('[Granola] Session note file not found:', this.notePath);
      return;
    }
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
      console.log('[Granola] Timestamped note added to ## Notes section');
    } else {
      // Fallback: append at end
      content += `\n\n${noteLine}`;
      new Notice('Granola: ## Notes section not found, appending note at end.');
      console.warn('[Granola] ## Notes section not found, appended at end');
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
      console.log('[Granola] Audio recording started', { micDevice, systemDevice, basePath });
    } catch (e) {
      new Notice('Granola: Error starting audio recording.');
      console.error('[Granola] Error starting audio recording:', e);
    }
    this.audioFilePath = this.audioRecorder.micFilePath;
    this.systemFilePath = this.audioRecorder.systemFilePath;
    // Create note from template
    if (this.app) {
      try {
        await this.createNoteFromTemplate(title, template, this.audioFilePath);
      } catch (e) {
        new Notice('Granola: Error creating note from template.');
        console.error('[Granola] Error creating note from template:', e);
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
      console.error('[Granola] Cannot end session: missing vault or notePath');
      return;
    }
    const file = this.vault.getAbstractFileByPath(this.notePath);
    if (!file || !(file instanceof TFile)) {
      new Notice('Granola: Session note file not found.');
      console.error('[Granola] Session note file not found:', this.notePath);
      return;
    }
    try {
      // Stop audio recording
      await this.audioRecorder.stopRecording();
      console.log('[Granola] Audio recording stopped');
    } catch (e) {
      new Notice('Granola: Error stopping audio recording.');
      console.error('[Granola] Error stopping audio recording:', e);
    }
    let transcript = '';
    if (this.settings.autoTranscribeOnEnd) {
      try {
        // Transcribe both tracks and merge
        transcript = await this.transcriber.transcribeDualTracks(this.audioFilePath, this.systemFilePath, this.settings.whisperLanguage || language);
        console.log('[Granola] Transcription complete');
      } catch (e) {
        new Notice('Granola: Error during transcription.');
        console.error('[Granola] Error during transcription:', e);
      }
    }
    let aiResults = { summary: '', actionItems: '', followupEmail: '' };
    try {
      // For now, extract notes section as empty string (TODO: parse notes from file)
      const notes = '';
      aiResults = await this.aiGenerator.generateSummary(notes, transcript);
      console.log('[Granola] AI summary generated');
    } catch (e) {
      new Notice('Granola: Error generating AI summary.');
      console.error('[Granola] Error generating AI summary:', e);
    }
    // Read note, insert transcript and AI results into appropriate sections
    let content = await this.vault.read(file);
    content = this._replaceSection(content, 'Transcript', transcript);
    content = this._replaceSection(content, 'Summary (AI)', aiResults.summary);
    content = this._replaceSection(content, 'Action Items', aiResults.actionItems);
    content = this._replaceSection(content, 'Follow-up Email', aiResults.followupEmail);
    await this.vault.modify(file, content);
    new Notice('Granola: Meeting session ended and note updated.');
    console.log('[Granola] Meeting session ended and note updated');
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
