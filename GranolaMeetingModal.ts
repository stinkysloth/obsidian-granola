import { App, Modal, Setting, DropdownComponent, TextComponent, ButtonComponent } from 'obsidian';
import { GranolaSettings } from './GranolaSettings';

export interface MeetingModalResult {
  title: string;
  template: string;
  micDevice: string;
  systemDevice: string;
  confirmed: boolean;
}

/**
 * Modal to prompt for meeting title, template, and audio device selection.
 */
export class GranolaMeetingModal extends Modal {
  result: MeetingModalResult = {
    title: '',
    template: '',
    micDevice: '',
    systemDevice: '',
    confirmed: false,
  };
  templates: string[];
  micDevices: string[];
  systemDevices: string[];
  onSubmit: (result: MeetingModalResult) => void;

  constructor(app: App, templates: string[], micDevices: string[], systemDevices: string[], onSubmit: (result: MeetingModalResult) => void) {
    super(app);
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
    new Setting(contentEl)
      .setName('Meeting Title')
      .addText((text: TextComponent) => {
        text.setPlaceholder('Enter meeting title...')
          .onChange((value) => this.result.title = value);
      });

    // Template selection
    new Setting(contentEl)
      .setName('Template')
      .addDropdown((dropdown: DropdownComponent) => {
        this.templates.forEach(t => dropdown.addOption(t, t));
        dropdown.onChange((value) => this.result.template = value);
        if (this.templates.length > 0) dropdown.setValue(this.templates[0]);
      });

    // Mic device selection
    new Setting(contentEl)
      .setName('Microphone Device')
      .addDropdown((dropdown: DropdownComponent) => {
        this.micDevices.forEach(d => dropdown.addOption(d, d));
        dropdown.onChange((value) => this.result.micDevice = value);
        if (this.micDevices.length > 0) dropdown.setValue(this.micDevices[0]);
      });

    // System device selection
    new Setting(contentEl)
      .setName('System Audio Device')
      .addDropdown((dropdown: DropdownComponent) => {
        this.systemDevices.forEach(d => dropdown.addOption(d, d));
        dropdown.onChange((value) => this.result.systemDevice = value);
        if (this.systemDevices.length > 0) dropdown.setValue(this.systemDevices[0]);
      });

    // Confirm button
    new Setting(contentEl)
      .addButton((btn: ButtonComponent) => {
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
