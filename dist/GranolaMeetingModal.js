"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GranolaMeetingModal = void 0;
const obsidian_1 = require("obsidian");
/**
 * Modal to prompt for meeting title, template, and audio device selection.
 */
class GranolaMeetingModal extends obsidian_1.Modal {
    constructor(app, templates, micDevices, systemDevices, onSubmit) {
        super(app);
        this.result = {
            title: '',
            template: '',
            micDevice: '',
            systemDevice: '',
            confirmed: false,
        };
        this.templates = templates;
        this.micDevices = micDevices;
        this.systemDevices = systemDevices;
        this.onSubmit = onSubmit;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Start New Meeting' });
        // Meeting title
        new obsidian_1.Setting(contentEl)
            .setName('Meeting Title')
            .addText((text) => {
            text.setPlaceholder('Enter meeting title...')
                .onChange((value) => this.result.title = value);
        });
        // Template selection
        new obsidian_1.Setting(contentEl)
            .setName('Template')
            .addDropdown((dropdown) => {
            this.templates.forEach(t => dropdown.addOption(t, t));
            dropdown.onChange((value) => this.result.template = value);
            if (this.templates.length > 0)
                dropdown.setValue(this.templates[0]);
        });
        // Mic device selection
        new obsidian_1.Setting(contentEl)
            .setName('Microphone Device')
            .addDropdown((dropdown) => {
            this.micDevices.forEach(d => dropdown.addOption(d, d));
            dropdown.onChange((value) => this.result.micDevice = value);
            if (this.micDevices.length > 0)
                dropdown.setValue(this.micDevices[0]);
        });
        // System device selection
        new obsidian_1.Setting(contentEl)
            .setName('System Audio Device')
            .addDropdown((dropdown) => {
            this.systemDevices.forEach(d => dropdown.addOption(d, d));
            dropdown.onChange((value) => this.result.systemDevice = value);
            if (this.systemDevices.length > 0)
                dropdown.setValue(this.systemDevices[0]);
        });
        // Confirm button
        new obsidian_1.Setting(contentEl)
            .addButton((btn) => {
            btn.setButtonText('Start Meeting')
                .setCta()
                .onClick(() => {
                this.result.confirmed = true;
                this.close();
            });
        });
    }
    onClose() {
        this.onSubmit(this.result);
        this.contentEl.empty();
    }
}
exports.GranolaMeetingModal = GranolaMeetingModal;
