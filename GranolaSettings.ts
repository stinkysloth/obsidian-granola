import { PluginSettingTab, App, Setting } from 'obsidian';

export interface GranolaSettings {
  audioFolder: string;
  whisperModel: string;
  whisperLanguage: string;
  llmEndpoint: string;
  templateFolder: string;
}

export const DEFAULT_SETTINGS: GranolaSettings = {
  audioFolder: 'attachments/granola_audio',
  whisperModel: 'base.en',
  whisperLanguage: 'en',
  llmEndpoint: 'http://localhost:11434/api/generate',
  templateFolder: 'granola-templates',
};

export class GranolaSettingsTab extends PluginSettingTab {
  plugin: any;

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Granola Notes Settings' });
    // Add settings here
  }
}
