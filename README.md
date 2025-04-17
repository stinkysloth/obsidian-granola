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

#### Automated Method (Recommended)

1. **Clone and Build:**
   ```sh
   git clone https://github.com/stinkysloth/obsidian-granola
   cd obsidian-granola
   npm install
   npm run build
   # This will compile TypeScript and automatically copy manifest.json and styles.css (if present) into dist/
   ```
   > The following scripts should be in your `package.json` for automation:
   > ```json
   > "scripts": {
   >   "build": "tsc",
   >   "devbuild": "tsc --outDir ../.obsidian/plugins/obsidian-granola",
   >   "postbuild": "cp manifest.json dist/ && cp styles.css dist/ || true"
   > }
   > ```

2. **Copy Plugin Files:**
   - Open your Obsidian vault folder.
   - Go to `.obsidian/plugins/` and create a folder named `granola-notes` (or your preferred name).
   - Copy **the contents of `dist/`** (not the folder itself) into your plugin folder. You should see:
     - `main.js`
     - `manifest.json`
     - (optional) `styles.css`

3. **Enable the Plugin:**
   - In Obsidian, go to Settings → Community plugins → Installed plugins.
   - Find "Granola Notes" and enable it.

#### Manual Method

If you prefer, you can manually copy files after building:

1. Run:
   ```sh
   npm install
   npm run build
   cp manifest.json dist/
   cp styles.css dist/  # Only if you have a styles.css
   ```
2. Copy the contents of `dist/` into your Obsidian plugin folder as above.

#### Development Build

For faster development iteration, use:
```sh
npm run devbuild
```
This will compile TypeScript directly into your Obsidian plugins folder, assuming the standard location.

**Troubleshooting:**
- Do NOT copy the entire project or the `dist/` folder itself—only its contents.
- If you update the plugin, repeat the build and copy steps above.
- If the plugin does not appear, check that `manifest.json` and `main.js` are in the correct folder.
- Restart Obsidian if changes are not detected.
- If you encounter TypeScript build errors, check your `tsconfig.json` configuration. This plugin uses ESNext modules with Node module resolution.

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
