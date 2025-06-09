Project Pilot – A VSCode Extension for Local Project Management

⸻

1. Purpose

Project Pilot empowers developers, creators, and solo entrepreneurs to manage structured local projects directly within VSCode. It bridges the gap between file-based project organization and intuitive task and workflow management, leveraging Markdown and folder structures as the project’s interface.

⸻

2. Problem Statement

Managing projects using local files lacks a coherent user interface for planning, logging, and reviewing work. Users must switch contexts between terminals, file explorers, and editors to perform basic project management tasks. There’s a lack of ergonomic tooling to integrate project logs, checklists, and file structures seamlessly inside the development environment.

⸻

3. Goals and Objectives
	•	Provide a minimal, intuitive UI inside VSCode to interact with structured local projects.
	•	Surface key project files (e.g., tasks.md, STATUS.md, logs) in a dashboard view.
	•	Enable creation and management of tasks, logs, and goals through quick commands.
	•	Facilitate fast navigation and editing of structured content (Markdown + folders).
	•	Remain entirely local-first, offline-capable, and file-transparent (no database).

⸻

4. Target Audience
	•	Developers and technical knowledge workers
	•	Indie hackers, solopreneurs, and researchers
	•	Users of PKM systems (Zettelkasten, Obsidian, etc.)
	•	Teams who want transparent, git-friendly project management

⸻

5. Features

5.1. Project Dashboard Panel
	•	Sidebar view listing:
	•	Project name (derived from folder)
	•	Status file preview (STATUS.md)
	•	Quick access to:
	•	0-planning/
	•	1-research/
	•	5-logs/
	•	tasks.md, timeline.md
	•	Visual indicators for tasks (done/undone), logs (date coverage), and goals

5.2. Task Management
	•	Inline Markdown checklist rendering (read/write)
	•	Command Palette:
	•	Add Task
	•	Mark Task Done
	•	Show Tasks by Folder
	•	Tasks aggregated from tasks.md, STATUS.md, and subfolder .md files

5.3. Daily Log System
	•	Create Daily Log command auto-generates logs/YYYY-MM-DD.md
	•	Log template includes:

## Goals
- [ ] ...
## Progress
- ...
## Notes
- ...


	•	Links logs into a timeline view

5.4. Directory Navigator
	•	Visual file tree filtered to the structured convention:

0-planning/
1-research/
2-assets/
3-development/
4-deliverables/
5-logs/

	•	Allows one-click creation of subfolders and templated files

5.5. Project Initialization Wizard
	•	Initialize Project Structure command scaffolds directories and common Markdown files from templates

5.6. Status Overview Badge
	•	Top bar or status bar badge summarizing:
	•	[x/y] tasks done
	•	Last log date
	•	Overall health (custom logic or tags)

⸻

6. Non-Goals
	•	Real-time collaboration
	•	Cloud sync or multi-device support
	•	Calendar-based Gantt chart views
	•	Full replacement for project management suites like Jira or Linear

⸻

7. Assumptions
	•	Users already use or are willing to adopt Markdown-based documentation
	•	Users are comfortable with file-centric project management
	•	Projects are managed in isolated root folders (not monorepo-based)

⸻

8. Technical Requirements

8.1. Architecture
	•	Language: TypeScript
	•	Framework: VSCode Extension API
	•	UI: VSCode Webview API for dashboards; TreeView API for sidebars

8.2. Storage
	•	Pure file-based: all data lives in Markdown or JSON files within the project folder
	•	Uses .vscode/project-pilot.json for user preferences

8.3. Performance
	•	Lightweight file parsing using fs and globby
	•	Caching parsed task lists in memory per session

⸻

9. User Workflows

🧭 Initialize a New Project
	1.	Run Project Pilot: Initialize Project
	2.	Select folder > scaffold created > STATUS.md opens in editor

🧾 Log Daily Progress
	1.	Run Project Pilot: New Daily Log
	2.	New log created with today’s date > opens in editor
	3.	Sidebar updates with log reference

✅ Manage Tasks
	1.	Open Sidebar > View list of tasks
	2.	Mark tasks done via checkboxes or Command Palette

⸻

10. Success Metrics
	•	⭐ 100+ GitHub stars within 3 months
	•	🧠 Positive feedback from productivity/hacker communities (e.g. Hacker News, r/PKM)
	•	📂 Used in > 1,000 local projects in first 6 months (telemetry opt-in)
	•	🧪 User satisfaction surveys >80% positive for usability

⸻

11. Future Roadmap (Post-MVP)
	•	Git integration (link commits to logs)
	•	Custom templates for log and task creation
	•	Lightweight AI assistant to summarize logs or suggest tasks
	•	Graph view of project activity over time

⸻

12. Risks and Mitigations

Risk	Mitigation
Users may not follow the strict folder structure	Allow user-defined mappings in .projectpilotrc
Performance lag in large directories	Cache parsed trees, debounce file watching
Feature bloat	Stick to local-first, Markdown-native philosophy

