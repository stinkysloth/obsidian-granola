# Granola Notes – Obsidian Plugin

Granola Notes is an Obsidian plugin for capturing, transcribing, and summarizing meetings—locally and privately. It enables you to record audio, take timestamped notes, transcribe using Whisper, and generate AI-powered summaries and action items.

---

## ✨ Features
- **Start a Meeting Session**: Create a new note from a template, record audio, and begin taking timestamped notes.
- **Dual-Track Recording (macOS)**: Capture both your microphone and system audio (e.g., Zoom) for speaker separation (requires BlackHole and ffmpeg).
- **Local Transcription**: Transcribe audio using Whisper.cpp or openai/whisper.
- **AI Summarization**: Generate summaries, action items, and follow-up emails using a local LLM (Ollama) or OpenAI, with automatic fallback if the primary model fails.
- **Custom Templates**: Use and edit templates for notes and prompts.
- **All Data Local**: No data leaves your vault unless you configure external APIs.

---

## 🚀 Getting Started

### 1. Requirements
- **Obsidian** (latest)
- **Node.js** (for plugin development)
- **macOS** (for dual-track audio; plugin works on other OSes with single-track)
- **ffmpeg**: `brew install ffmpeg`
- **BlackHole**: [Install BlackHole](https://existential.audio/blackhole/)
- **Whisper.cpp**: [Install instructions](https://github.com/ggerganov/whisper.cpp)
- **Ollama** (optional, for local LLM): `brew install ollama`
- **OpenAI API** (optional, for fallback): [Sign up for an API key](https://platform.openai.com/)

### 2. Build & Install the Plugin

#### Development Build (Recommended)

1. **Clone and Install Dependencies:**
   ```sh
   git clone https://github.com/stinkysloth/obsidian-granola
   cd obsidian-granola
   npm install
   ```

2. **Build Directly to Your Obsidian Plugins Folder:**
   ```sh
   npm run dev
   ```
   This will bundle the plugin and place it directly in `../.obsidian/plugins/obsidian-granola/`.

3. **Enable the Plugin:**
   - In Obsidian, go to Settings → Community plugins → Installed plugins.
   - Find "Granola Notes" and enable it.

#### Production Build

For a production build:

```sh
npm run build
```

This will create a bundled version in the `dist/` folder that you can distribute.

**Troubleshooting:**
- If you encounter module resolution errors, make sure you're using the bundled build process (esbuild) rather than just TypeScript compilation.
- The plugin uses a bundled approach to ensure all modules are properly resolved in Obsidian's runtime environment.
- If you're developing, use `npm run dev` which creates source maps for easier debugging.

---

## 🛠️ Usage

1. **Start a Meeting**: Use the command palette (Cmd+P) and select `Granola: Start New Meeting`.
   - Fill in meeting title, template, and select audio devices.
2. **Take Timestamped Notes**: Use the plugin command or UI (coming soon) to add notes during the meeting.
3. **End Meeting**: (Add command or UI) Stops recording, transcribes, and inserts transcript and AI summary into your note.

### AI Summarization & Fallback
- The plugin uses a robust prompt to instruct the AI model to return a JSON object with `summary`, `actionItems`, and `followupEmail` fields.
- If the primary LLM endpoint (e.g., Ollama) fails, and a fallback endpoint/model is configured (e.g., OpenAI), the plugin will automatically retry using the fallback.
- If all attempts fail, empty results are returned and an error is logged.
- You can configure the endpoints and models in the plugin settings.

### Template Variables
- `{{title}}`, `{{date}}`, `{{audio_file_path}}` are replaced in new notes.

---

## 🧪 Testing

Tests are written with [Vitest](https://vitest.dev/). To run:
```sh
npm run test
```
Test coverage includes:
- Note creation from template
- Timestamped note insertion
- Session end (transcription and summary insertion)
- AI summarization and fallback logic

---

## 🛡️ Privacy
- All audio, notes, and AI interactions are local by default.
- Optional OpenAI or other API integration available. No data leaves your machine unless you configure an external endpoint.

---

## 📎 Contributing
- PRs welcome! Please add/modify tests for new features.

---

## 📚 License
MIT
