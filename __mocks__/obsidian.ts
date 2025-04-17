// Jest mock for Obsidian API
export class App {}
export class TFile { name = ''; }
export class TFolder { children: any[] = []; }
export class Vault {
  getAbstractFileByPath = jest.fn();
  read = jest.fn();
  modify = jest.fn();
}
export class Notice {
  constructor(msg: string) { /* no-op for tests */ }
}
export function normalizePath(p: string) { return p; }
export class TAbstractFile {}
export class PluginSettingTab {}
export class Plugin {}
