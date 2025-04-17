# Granola Notes – Obsidian Plugin

## Overview
Granola Notes is an Obsidian plugin for local meeting audio capture, transcription (Whisper), timestamped notes, and AI-powered summarization, all stored within the user's vault. It prioritizes privacy, offline support, and extensibility via templates and local LLMs.

---

## Architecture & Tech Stack
- **Language:** TypeScript (plugin), Python (optional for Whisper)
- **Obsidian API** for plugin integration
- **Audio Capture:** MediaRecorder API (browser), or ffmpeg/node-record-lpcm16
- **Transcription:** whisper.cpp (local, via child process)
- **AI Summarization:** Local LLM (Ollama HTTP API) or OpenAI fallback
- **Templating:** User-defined templates with Templater-style variables

---

## File/Folder Structure
```
obsidian-granola/
├── main.ts                  # Main plugin entry
├── manifest.json            # Obsidian plugin manifest
├── GranolaSettings.ts       # Settings tab + persistent config
├── MeetingSession.ts        # Meeting session manager
├── AudioRecorder.ts         # Audio capture interface
├── Transcriber.ts           # Whisper transcription wrapper
├── AIGenerator.ts           # Local LLM prompt generation & response
├── templates/               # User-defined templates for notes
├── styles.css               # Plugin styles
├── PLANNING.md              # Project architecture & notes
├── TASK.md                  # Task tracker
└── README.md                # Project overview & setup
```

---

## Key Features
1. **Meeting Session Management**: Start/stop meetings, note creation from templates, status bar UI.
2. **Audio Recording**: Local mic/system audio capture, configurable storage, audio player integration.
3. **Timestamped Notes**: Notes with audio-relative timestamps, clickable for playback.
4. **Transcription**: Local Whisper (configurable model/language), output to note.
5. **AI Summarization**: Local LLM or OpenAI, summary/action items/email generation.
6. **Templating**: User-editable templates with variables.
7. **Export/Sharing**: Markdown/PDF export, optional email send.

---

## Naming Conventions & Patterns
- **Files:** PascalCase for TypeScript modules, kebab-case for folders
- **Imports:** Relative within plugin
- **Testing:** Jest/ts-jest for TypeScript unit tests (in `/tests`)
- **Settings:** Stored via Obsidian plugin API

---

## Constraints
- All files <500 lines (split modules as needed)
- PEP8 for Python (if used for Whisper)
- Docstrings for all functions (Google style)
- All logic testable via Jest/ts-jest
- No external DB; all data in vault

---

## TODO
- [ ] Scaffold core files
- [ ] Implement command: Start New Meeting
- [ ] Audio recording interface
- [ ] Transcription wrapper
- [ ] AI summarization integration
- [ ] Templating system
- [ ] Export features
- [ ] Unit tests for each module
