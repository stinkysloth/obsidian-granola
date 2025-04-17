"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GranolaSettingsTab = exports.DEFAULT_SETTINGS = void 0;
const obsidian_1 = require("obsidian");
exports.DEFAULT_SETTINGS = {
    audioFolder: 'attachments/granola_audio',
    whisperModel: 'base.en',
    whisperLanguage: 'en',
    llmEndpoint: 'http://localhost:11434/api/generate',
    templateFolder: 'granola-templates',
    aiModel: 'mistral',
    aiTemperature: 0.7,
    enableDualTrack: true,
    defaultMicDevice: '',
    defaultSystemDevice: '',
    autoInsertTimestamp: true,
    autoTranscribeOnEnd: true,
    showStatusBar: true,
};
class GranolaSettingsTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Granola Notes Settings' });
        // Audio folder
        new obsidian_1.Setting(containerEl)
            .setName('Audio Folder')
            .setDesc('Where to save meeting audio files')
            .addText(text => text
            .setPlaceholder('attachments/granola_audio')
            .setValue(this.plugin.settings.audioFolder)
            .onChange(async (value) => {
            this.plugin.settings.audioFolder = value;
            await this.plugin.saveSettings();
        }));
        // Whisper model
        new obsidian_1.Setting(containerEl)
            .setName('Whisper Model')
            .setDesc('Model to use for transcription (e.g., base.en, small.en)')
            .addText(text => text
            .setPlaceholder('base.en')
            .setValue(this.plugin.settings.whisperModel)
            .onChange(async (value) => {
            this.plugin.settings.whisperModel = value;
            await this.plugin.saveSettings();
        }));
        // Whisper language
        new obsidian_1.Setting(containerEl)
            .setName('Whisper Language')
            .setDesc('Language code for transcription (e.g., en, es)')
            .addText(text => text
            .setPlaceholder('en')
            .setValue(this.plugin.settings.whisperLanguage)
            .onChange(async (value) => {
            this.plugin.settings.whisperLanguage = value;
            await this.plugin.saveSettings();
        }));
        // LLM Endpoint
        new obsidian_1.Setting(containerEl)
            .setName('LLM Endpoint')
            .setDesc('URL for AI summary/action items (Ollama/OpenAI)')
            .addText(text => text
            .setPlaceholder('http://localhost:11434/api/generate')
            .setValue(this.plugin.settings.llmEndpoint)
            .onChange(async (value) => {
            this.plugin.settings.llmEndpoint = value;
            await this.plugin.saveSettings();
        }));
        // AI Model
        new obsidian_1.Setting(containerEl)
            .setName('AI Model')
            .setDesc('Model to use for AI (e.g., mistral, llama2, gpt-3.5-turbo)')
            .addText(text => text
            .setPlaceholder('mistral')
            .setValue(this.plugin.settings.aiModel)
            .onChange(async (value) => {
            this.plugin.settings.aiModel = value;
            await this.plugin.saveSettings();
        }));
        // AI Temperature
        new obsidian_1.Setting(containerEl)
            .setName('AI Temperature')
            .setDesc('Creativity for AI (0.0 = deterministic, 1.0 = creative)')
            .addSlider(slider => slider
            .setLimits(0, 1, 0.01)
            .setValue(this.plugin.settings.aiTemperature)
            .onChange(async (value) => {
            this.plugin.settings.aiTemperature = value;
            await this.plugin.saveSettings();
        }));
        // Template folder
        new obsidian_1.Setting(containerEl)
            .setName('Template Folder')
            .setDesc('Folder for meeting note templates')
            .addText(text => text
            .setPlaceholder('granola-templates')
            .setValue(this.plugin.settings.templateFolder)
            .onChange(async (value) => {
            this.plugin.settings.templateFolder = value;
            await this.plugin.saveSettings();
        }));
        // Enable dual-track recording
        new obsidian_1.Setting(containerEl)
            .setName('Enable Dual-Track Recording')
            .setDesc('Record mic and system audio separately (macOS only)')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enableDualTrack)
            .onChange(async (value) => {
            this.plugin.settings.enableDualTrack = value;
            await this.plugin.saveSettings();
        }));
        // Default mic device
        new obsidian_1.Setting(containerEl)
            .setName('Default Mic Device')
            .setDesc('Default microphone input device name')
            .addText(text => text
            .setPlaceholder('MacBook Pro Microphone')
            .setValue(this.plugin.settings.defaultMicDevice)
            .onChange(async (value) => {
            this.plugin.settings.defaultMicDevice = value;
            await this.plugin.saveSettings();
        }));
        // Default system device
        new obsidian_1.Setting(containerEl)
            .setName('Default System Device')
            .setDesc('Default system audio device name (e.g., BlackHole)')
            .addText(text => text
            .setPlaceholder('BlackHole 2ch')
            .setValue(this.plugin.settings.defaultSystemDevice)
            .onChange(async (value) => {
            this.plugin.settings.defaultSystemDevice = value;
            await this.plugin.saveSettings();
        }));
        // Auto-insert timestamp
        new obsidian_1.Setting(containerEl)
            .setName('Auto-Insert Timestamp')
            .setDesc('Automatically insert timestamp with each note')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.autoInsertTimestamp)
            .onChange(async (value) => {
            this.plugin.settings.autoInsertTimestamp = value;
            await this.plugin.saveSettings();
        }));
        // Auto-transcribe on end
        new obsidian_1.Setting(containerEl)
            .setName('Auto-Transcribe on End')
            .setDesc('Automatically transcribe and summarize when ending meeting')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.autoTranscribeOnEnd)
            .onChange(async (value) => {
            this.plugin.settings.autoTranscribeOnEnd = value;
            await this.plugin.saveSettings();
        }));
        // Show status bar
        new obsidian_1.Setting(containerEl)
            .setName('Show Status Bar')
            .setDesc('Show meeting status and controls in the status bar')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showStatusBar)
            .onChange(async (value) => {
            this.plugin.settings.showStatusBar = value;
            await this.plugin.saveSettings();
        }));
    }
}
exports.GranolaSettingsTab = GranolaSettingsTab;
