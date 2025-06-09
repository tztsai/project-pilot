# Project Pilot

A VSCode Extension for Local Project Management - Organize projects with structured folders, tasks, and daily logs.

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![VSCode](https://img.shields.io/badge/VSCode-1.100.0+-green.svg)](https://code.visualstudio.com/)

## Overview

Project Pilot bridges the gap between file-based project organization and intuitive task and workflow management. It empowers developers, creators, and solo entrepreneurs to manage structured local projects directly within VSCode, leveraging Markdown and folder structures as the project's interface.

## ✨ Features

### 🚀 **Project Initialization & Structure**
- **One-command project setup**: Initialize structured project directories with `Project Pilot: Initialize Project Structure`
- **Standardized folder organization**: Automatic creation of 0-planning/, 1-research/, 2-assets/, 3-development/, 4-deliverables/, 5-logs/
- **Template system**: Auto-generated STATUS.md, tasks.md, and timeline.md with sensible defaults

### 📋 **Task Management**
- **Unified task view**: Aggregate tasks from all Markdown files across your project
- **Interactive task interface**: Toggle completion, edit tasks, and navigate to source files
- **Multi-file task support**: Tasks detected from STATUS.md, tasks.md, and any project Markdown files
- **Quick task creation**: Add new tasks via Command Palette with file selection

### 🌲 **Project Navigation**
- **Custom sidebar**: Filtered tree view showing only structured project folders
- **Task indicators**: Visual badges showing task counts per file
- **Smart context menus**: File/folder creation actions in structured directories
- **One-click file access**: Direct navigation to project files

### 📊 **Project Metrics & Status**
- **Status bar integration**: Live display of task completion (completed/total) and log activity
- **Project health tracking**: Visual indicators for project momentum and task progress
- **Real-time updates**: Automatic refresh when files change

## 🛠 Installation & Setup

1. **Install the extension** (when published to marketplace)
2. **Open a workspace folder** in VSCode
3. **Initialize your project**: Run `Project Pilot: Initialize Project Structure` from Command Palette (Cmd/Ctrl+Shift+P)
4. **Start organizing**: The extension will detect your project and activate automatically

## 🚦 Quick Start

### Initialize a New Project
```
1. Open VSCode in your project folder
2. Cmd/Ctrl+Shift+P → "Project Pilot: Initialize Project Structure"
3. Enter your project name
4. ✅ Project structure created with STATUS.md opened for editing
```

### Manage Tasks
```
1. Cmd/Ctrl+Shift+P → "Project Pilot: Show All Tasks"
2. Select a task to toggle completion or navigate to source
3. Use "Project Pilot: Add Task" to create new tasks
4. Tasks automatically sync across all project Markdown files
```

### Track Progress
```
1. Check status bar for live task completion metrics
2. View project structure in the Project Pilot sidebar
3. Monitor daily log activity and project momentum
```

## 📁 Project Structure

Project Pilot creates and manages this standardized structure:

```
your-project/
├── .vscode/
│   └── project-pilot.json    # Extension configuration
├── 0-planning/               # Project planning documents
│   └── README.md
├── 1-research/               # Research materials and references
│   └── README.md
├── 2-assets/                 # Images, designs, resources
│   └── README.md
├── 3-development/            # Code, prototypes, iterations
│   └── README.md
├── 4-deliverables/           # Final outputs and releases
│   └── README.md
├── 5-logs/                   # Daily logs and progress tracking
│   └── README.md
├── STATUS.md                 # Current project status and progress
├── tasks.md                  # Project task list and todos
└── timeline.md               # Project milestones and timeline
```

## ⚙️ Configuration

Project Pilot stores configuration in `.vscode/project-pilot.json`:

```json
{
  "version": "1.0.0",
  "projectName": "My Project",
  "customFolders": {},
  "preferences": {
    "autoCreateLogs": true,
    "taskAggregation": ["tasks.md", "STATUS.md"]
  }
}
```

### Extension Settings

- `projectPilot.autoCreateLogs`: Automatically create daily logs (default: true)
- `projectPilot.taskAggregationFiles`: Files to scan for tasks (default: ["tasks.md", "STATUS.md"])
- `projectPilot.logTemplate`: Template to use for daily logs (default: "default")

## 🎯 Commands

| Command                                       | Description                           |
| --------------------------------------------- | ------------------------------------- |
| `Project Pilot: Initialize Project Structure` | Set up project folder structure       |
| `Project Pilot: Open Dashboard`               | Open project dashboard (coming soon)  |
| `Project Pilot: New Daily Log`                | Create today's log file (coming soon) |
| `Project Pilot: Add Task`                     | Add a new task to project files       |
| `Project Pilot: Toggle Task`                  | Mark task as complete/incomplete      |
| `Project Pilot: Show All Tasks`               | View and manage all project tasks     |
| `Project Pilot: Show Tasks by Folder`         | Browse tasks organized by file        |

## 🏗 Architecture

Project Pilot is built with clean, modular architecture:

```
src/
├── extension.ts              # Main extension entry point
├── models/
│   ├── Project.ts           # Project data model with metrics
│   ├── Task.ts              # Task representation and methods
│   └── Log.ts               # Daily log model
├── services/
│   ├── FileService.ts       # File I/O operations
│   ├── MarkdownParser.ts    # Parse MD files for tasks/content
│   └── ProjectService.ts    # Core project operations
├── providers/
│   ├── ProjectTreeProvider.ts # TreeView data provider
│   └── TaskProvider.ts      # Task management provider
├── commands/
│   └── index.ts             # Command definitions and handlers
└── views/
    └── dashboard/           # Webview components (coming soon)
```

## 🚧 Development Status

**Phase 1.1 Complete** ✅
- ✅ Extension scaffold and TypeScript setup
- ✅ Core architecture with models, services, and providers
- ✅ Project detection and configuration system
- ✅ Command framework with all core commands registered
- ✅ TreeView provider for project navigation
- ✅ Task provider with interactive management
- ✅ File watching and real-time updates
- ✅ Status bar integration with project metrics

**Coming Next (Phase 1.2+)**
- 🚧 Daily log system with auto-generation
- 🚧 Dashboard webview with project overview
- 🚧 Enhanced markdown parsing and task manipulation
- 🚧 Timeline view integration
- 🚧 Performance optimization and caching

## 🎨 Design Philosophy

- **Local-first**: Everything lives in your file system, no database required
- **Markdown-native**: Leverage existing markdown knowledge and tools
- **File-transparent**: All data accessible and editable outside the extension
- **Git-friendly**: Version control your entire project management system
- **Zero-configuration**: Sensible defaults with optional customization

## 🤝 Contributing

Project Pilot is in active development. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with the VSCode Extension API and inspired by modern project management methodologies and personal knowledge management systems.

---

**Happy project piloting!** 🚁
