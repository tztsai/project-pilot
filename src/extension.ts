// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProjectService } from './services/ProjectService';
import { registerCommands } from './commands';
import { Project } from './models/Project';

let projectService: ProjectService;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Project Pilot extension is being activated');

	// Initialize project service
	projectService = new ProjectService(context);

	// Register all commands
	registerCommands(context, projectService);

	// Set up workspace detection
	setupWorkspaceDetection();

	// Initialize status bar
	setupStatusBar(context);

	console.log('Project Pilot extension activated successfully');
}

function setupWorkspaceDetection() {
	// Check if current workspace is a Project Pilot project
	checkAndSetProjectContext();

	// Watch for workspace changes
	vscode.workspace.onDidChangeWorkspaceFolders(() => {
		checkAndSetProjectContext();
	});

	// Watch for project-pilot.json changes
	const watcher = vscode.workspace.createFileSystemWatcher('**/.vscode/project-pilot.json');
	watcher.onDidCreate(() => checkAndSetProjectContext());
	watcher.onDidChange(() => checkAndSetProjectContext());
	watcher.onDidDelete(() => checkAndSetProjectContext());
}

async function checkAndSetProjectContext() {
	const isProjectPilotProject = await projectService.detectProject();
	await vscode.commands.executeCommand('setContext', 'projectpilot.isProjectPilotProject', isProjectPilotProject);
	
	if (isProjectPilotProject) {
		console.log('Project Pilot project detected');
		// Refresh project data
		await projectService.refreshProject();
	}
}

function setupStatusBar(context: vscode.ExtensionContext) {
	// Create status bar item for project metrics
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItem.command = 'projectpilot.openDashboard';
	statusBarItem.tooltip = 'Project Pilot - Click to open dashboard';
	
	context.subscriptions.push(statusBarItem);

	// Update status bar when project changes
	projectService.onProjectChanged((project: Project | null) => {
		if (project) {
			const metrics = project.metrics;
			statusBarItem.text = `📋 ${metrics.completedTasks}/${metrics.totalTasks} | 📝 ${metrics.lastLogDays}d`;
			statusBarItem.show();
		} else {
			statusBarItem.hide();
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('Project Pilot extension deactivated');
}
