<div align="center">
  <img src="logo-1254x1254px-圆角279-6.png" alt="Logo" width="200" />
</div>

English | [中文](./README.md)

# Electron Desktop App Scaffold

A reusable Electron desktop UI scaffold template. Clone this repo to skip the tedious boilerplate setup when building a similar desktop application.

> **UI Design Note**: The UI design of this project is inspired by [OpenAI Codex CLI](https://github.com/openai/codex), with adaptations and extensions on top of it.

**Author**: 李召伟 Leo

## Preview

<img src="ui-1.png" alt="Screenshot 1" width="600" />

<img src="ui-2.png" alt="Screenshot 2" width="600" />

## Features

| Feature | Description |
|---------|-------------|
| Frameless Transparent Window | Frameless window + macOS vibrancy effect |
| Sidebar | Collapsible sidebar with expand/collapse animation |
| System Tray | macOS Dock icon + tray menu; Windows taskbar icon + tray |
| Unified Icon System | Multi-resolution ICO (Windows) / ICNS (macOS) / PNG auto-adaptation |
| Window Controls | Minimize / Maximize / Close, macOS Traffic Lights support |
| Drag Area | Native drag-to-move at the top of the window |
| Cross-platform Layout | Auto-detect macOS / Windows, adapt window control positions |

## Tech Stack

- **Electron 41** — Desktop app framework
- **Vue 3** + **TypeScript** — Frontend framework
- **Vite 8** — Build tool
- **shadcn-vue** — UI component library (Reka UI + Tailwind CSS v4)
- **lucide-vue-next** — Icon library

## Project Structure

```
desktop-app/
├── electron/
│   ├── main.ts           # Main process: window creation, tray, IPC
│   └── preload.cjs       # Preload script (must be CommonJS)
├── src/
│   ├── components/
│   │   └── Sidebar.vue   # Sidebar component (with collapse logic)
│   ├── lib/              # Utility functions
│   ├── App.vue           # Main layout (left-right layout)
│   └── style.css         # Global styles
├── vite.config.ts        # Vite + Electron plugin config
└── package.json
```

## Quick Start

```bash
cd desktop-app
cnpm install
cnpm run dev
```

## Build

```bash
cd desktop-app
cnpm run build
```

## Usage

1. Clone this repository:
   ```bash
   git clone <repository-url> your-new-project
   cd your-new-project
   ```
2. Modify the app name and description in `package.json`
3. Replace icon files in `electron/icons/`
4. Build your business logic in `src/` — the sidebar and layout framework are ready to use

