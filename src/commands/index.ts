import * as vscode from 'vscode';
import { ProjectService } from '../services/ProjectService';
import { TaskProvider } from '../providers/TaskProvider';

export function registerCommands(
  context: vscode.ExtensionContext, 
  projectService: ProjectService,
  taskProvider: TaskProvider
): void {
  // Initialize Project command
  const initializeCommand = vscode.commands.registerCommand('projectpilot.initialize', async () => {
    try {
      await projectService.initializeProject();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to initialize project: ${error}`);
    }
  });

  // Open Dashboard command
  const openDashboardCommand = vscode.commands.registerCommand('projectpilot.openDashboard', async () => {
    try {
      const project = projectService.getCurrentProject();
      if (!project) {
        vscode.window.showWarningMessage('No Project Pilot project found in workspace. Initialize a project first.');
        return;
      }
      
      // TODO: Implement dashboard panel
      vscode.window.showInformationMessage('Dashboard feature coming soon!');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open dashboard: ${error}`);
    }
  });

  // New Daily Log command
  const newDailyLogCommand = vscode.commands.registerCommand('projectpilot.newDailyLog', async () => {
    try {
      const project = projectService.getCurrentProject();
      if (!project) {
        vscode.window.showWarningMessage('No Project Pilot project found in workspace. Initialize a project first.');
        return;
      }
      
      // TODO: Implement daily log creation
      vscode.window.showInformationMessage('Daily log feature coming soon!');
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to create daily log: ${error}`);
    }
  });

  // Add Task command
  const addTaskCommand = vscode.commands.registerCommand('projectpilot.addTask', async () => {
    try {
      await taskProvider.addTask();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add task: ${error}`);
    }
  });

  // Toggle Task command
  const toggleTaskCommand = vscode.commands.registerCommand('projectpilot.toggleTask', async () => {
    try {
      await taskProvider.toggleTask();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to toggle task: ${error}`);
    }
  });

  // Show All Tasks command
  const showTasksCommand = vscode.commands.registerCommand('projectpilot.showTasks', async () => {
    try {
      await taskProvider.showAllTasks();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to show tasks: ${error}`);
    }
  });

  // Show Tasks by Folder command
  const showTasksByFolderCommand = vscode.commands.registerCommand('projectpilot.showTasksByFolder', async () => {
    try {
      await taskProvider.showTasksByFolder();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to show tasks by folder: ${error}`);
    }
  });

  // Register all commands with context
  context.subscriptions.push(
    initializeCommand,
    openDashboardCommand,
    newDailyLogCommand,
    addTaskCommand,
    toggleTaskCommand,
    showTasksCommand,
    showTasksByFolderCommand
  );

  console.log('Project Pilot commands registered successfully');
} 