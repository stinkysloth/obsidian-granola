import { Plugin } from 'obsidian';

export default class GranolaNotesPlugin extends Plugin {
  async onload() {
    // Register core commands and settings here
    console.log('Granola Notes plugin loaded');
  }

  onunload() {
    console.log('Granola Notes plugin unloaded');
  }
}
