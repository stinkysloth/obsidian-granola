"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const GranolaSettings_1 = require("./GranolaSettings");
const MeetingSession_1 = require("./MeetingSession");
const AudioRecorder_1 = require("./AudioRecorder");
const Transcriber_1 = require("./Transcriber");
const AIGenerator_1 = require("./AIGenerator");
const GranolaMeetingModal_1 = require("./GranolaMeetingModal");
/**
 * Main entry point for the Granola Notes Obsidian plugin.
 * Handles command registration, settings, and core module wiring.
 */
class GranolaNotesPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.session = null;
        this.statusBarEl = null;
    }
    async onload() {
        // Load settings
        this.settings = Object.assign({}, GranolaSettings_1.DEFAULT_SETTINGS, await this.loadData());
        // Register settings tab
        this.addSettingTab(new GranolaSettings_1.GranolaSettingsTab(this.app, this));
        // Register core command: Start New Meeting
        this.addCommand({
            id: 'granola-start-meeting',
            name: 'Granola: Start New Meeting',
            callback: async () => {
                // --- 1. Get Templates List ---
                const templatesFolder = this.settings.templateFolder;
                let templates = [];
                try {
                    const folder = this.app.vault.getAbstractFileByPath(templatesFolder);
                    if (folder && folder instanceof obsidian_1.TFolder) {
                        templates = folder.children.filter((f) => f instanceof obsidian_1.TFile).map((f) => f.basename);
                    }
                }
                catch (e) {
                    // fallback: single default
                    templates = ['default'];
                }
                if (templates.length === 0)
                    templates = ['default'];
                // --- 2. Device Lists (use settings if provided) ---
                const micDevices = this.settings.defaultMicDevice ? [this.settings.defaultMicDevice] : ['MacBook Pro Microphone'];
                const systemDevices = this.settings.defaultSystemDevice ? [this.settings.defaultSystemDevice] : ['BlackHole 2ch'];
                // --- 3. Show Modal ---
                new GranolaMeetingModal_1.GranolaMeetingModal(this.app, templates, micDevices, systemDevices, async (result) => {
                    if (!result.confirmed)
                        return;
                    const { title, template, micDevice, systemDevice } = result;
                    const basePath = `${this.settings.audioFolder}/${Date.now()}_${title.replace(/\s+/g, '_')}`;
                    // Initialize core modules using settings
                    const audioRecorder = new AudioRecorder_1.AudioRecorder(this.settings);
                    const transcriber = new Transcriber_1.Transcriber('path/to/whisper.cpp', this.settings.whisperModel); // Use settings
                    const aiGenerator = new AIGenerator_1.AIGenerator(this.settings.llmEndpoint, this.settings.aiModel); // Use settings
                    // Start new session (pass app context for note creation)
                    this.session = new MeetingSession_1.MeetingSession(audioRecorder, transcriber, aiGenerator, this.app, this.settings);
                    await this.session.start(title, template, micDevice || this.settings.defaultMicDevice, systemDevice || this.settings.defaultSystemDevice, basePath);
                    new obsidian_1.Notice('Granola: Meeting session started');
                    this.showStatusBar('Meeting in progress...');
                }).open();
            },
        });
        // Show/hide status bar based on settings
        if (this.settings.showStatusBar) {
            this.showStatusBar('Ready for new meeting');
        }
        // TODO: Register additional commands and event handlers
        console.log('Granola Notes plugin loaded');
    }
    onunload() {
        this.hideStatusBar();
        console.log('Granola Notes plugin unloaded');
    }
    /**
     * Save plugin settings to disk.
     */
    async saveSettings() {
        await this.saveData(this.settings);
        // Update status bar visibility if settings change
        if (this.settings.showStatusBar) {
            this.showStatusBar('Ready for new meeting');
        }
        else {
            this.hideStatusBar();
        }
    }
    /**
     * Show the status bar if enabled in settings.
     */
    showStatusBar(text) {
        if (!this.settings.showStatusBar) {
            this.hideStatusBar();
            return;
        }
        if (!this.statusBarEl) {
            this.statusBarEl = this.addStatusBarItem();
            this.statusBarEl.classList.add('granola-status-bar');
        }
        this.statusBarEl.setText(text);
    }
    /**
     * Hide the status bar and remove its element.
     */
    hideStatusBar() {
        if (this.statusBarEl) {
            this.statusBarEl.detach();
            this.statusBarEl = null;
        }
    }
}
exports.default = GranolaNotesPlugin;
