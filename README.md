# Granola Notes – Obsidian Plugin

Granola Notes brings local audio capture, transcription, timestamped notes, and AI-powered meeting summaries to your Obsidian vault. All processing is local-first for privacy and speed.

## Features
- Start/stop meeting sessions with audio recording
- Timestamped note-taking
- Local Whisper transcription
- AI summarization (Ollama or OpenAI)
- Customizable templates
- Export to Markdown/PDF

## Setup
1. Clone repo: `git clone https://github.com/yourusername/obsidian-granola`
2. `npm install`
3. `npm run build`
4. Link plugin to your vault: `ln -s dist/ ~/ObsidianVault/.obsidian/plugins/granola-notes`

## Requirements
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- [ffmpeg](https://ffmpeg.org/)
- [Ollama](https://ollama.ai/) (optional for local LLM)

## Development
- TypeScript, Obsidian API
- All logic is unit tested (see `/tests`)
- See `PLANNING.md` for architecture

## Privacy
All audio, notes, and LLM queries are processed locally by default.
