import * as vscode from 'vscode';
import * as path from 'path';
import { Project, ProjectConfig } from '../models/Project';
import { FileService } from './FileService';
import { MarkdownParser } from './MarkdownParser';

export class ProjectService {
  private context: vscode.ExtensionContext;
  private currentProject: Project | null = null;
  private projectChangeEmitter = new vscode.EventEmitter<Project | null>();

  readonly onProjectChanged = this.projectChangeEmitter.event;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async detectProject(): Promise<boolean> {
    const workspaceRoot = FileService.getWorkspaceRoot();
    if (!workspaceRoot) {
      return false;
    }

    // Check for project-pilot.json
    const configPath = path.join(workspaceRoot, '.vscode', 'project-pilot.json');
    if (await FileService.exists(configPath)) {
      return true;
    }

    // Fallback: check for common files and folder structure
    const pmDir = path.join(workspaceRoot, '.pm');
    const statusPath = path.join(workspaceRoot, '.pm', 'STATUS.md');
    const tasksPath = path.join(workspaceRoot, '.pm', 'tasks.md');
    const logsDir = path.join(workspaceRoot, '.pm', '5-logs');
    
    const hasPmDir = await FileService.exists(pmDir);
    const hasStatusFile = await FileService.exists(statusPath);
    const hasTasksFile = await FileService.exists(tasksPath);
    const hasLogsDir = await FileService.exists(logsDir);

    return hasPmDir || hasStatusFile || hasTasksFile || hasLogsDir;
  }

  async refreshProject(): Promise<void> {
    const workspaceRoot = FileService.getWorkspaceRoot();
    if (!workspaceRoot) {
      this.setCurrentProject(null);
      return;
    }

    try {
      const project = await this.loadProject(workspaceRoot);
      this.setCurrentProject(project);
    } catch (error) {
      console.error('Failed to load project:', error);
      this.setCurrentProject(null);
    }
  }

  private async loadProject(rootPath: string): Promise<Project> {
    const configPath = path.join(rootPath, '.vscode', 'project-pilot.json');
    let config: ProjectConfig;

    if (await FileService.exists(configPath)) {
      const configContent = await FileService.readFile(configPath);
      config = JSON.parse(configContent);
    } else {
      // Create default config
      const folderName = path.basename(rootPath);
      config = Project.createDefaultConfig(folderName);
      await this.saveProjectConfig(rootPath, config);
    }

    const project = new Project(rootPath, config);
    
    // Load tasks and logs
    await this.loadProjectData(project);
    
    return project;
  }

  private async loadProjectData(project: Project): Promise<void> {
    try {
      // Load tasks from configured files
      const tasks = await this.loadProjectTasks(project);
      project.tasks = tasks;

      // Load logs from logs directory
      const logs = await this.loadProjectLogs(project);
      project.logs = logs;
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }

  private async loadProjectTasks(project: Project): Promise<any[]> {
    const taskFiles: string[] = [];
    
    // Get configured task aggregation files
    for (const fileName of project.config.preferences.taskAggregation) {
      const filePath = path.join(project.rootPath, '.pm', fileName);
      if (await FileService.exists(filePath)) {
        taskFiles.push(filePath);
      }
    }

    // Also scan for all markdown files in the project structure
    const pmDir = path.join(project.rootPath, '.pm');
    if (await FileService.exists(pmDir)) {
      const allMdFiles = await FileService.findFiles(pmDir, ['**/*.md']);
      taskFiles.push(...allMdFiles);
    }

    // Remove duplicates
    const uniqueTaskFiles = [...new Set(taskFiles)];
    
    // Aggregate tasks from all files
    return await MarkdownParser.aggregateTasksFromProject(project.rootPath, uniqueTaskFiles);
  }

  private async loadProjectLogs(project: Project): Promise<any[]> {
    // TODO: Implement log loading from 5-logs directory
    // For now, return empty array - this will be implemented in Phase 4
    return [];
  }

  private async saveProjectConfig(rootPath: string, config: ProjectConfig): Promise<void> {
    const configPath = path.join(rootPath, '.vscode', 'project-pilot.json');
    const configContent = JSON.stringify(config, null, 2);
    await FileService.writeFile(configPath, configContent);
  }

  private setCurrentProject(project: Project | null): void {
    this.currentProject = project;
    this.projectChangeEmitter.fire(project);
  }

  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  async initializeProject(folderUri?: vscode.Uri): Promise<void> {
    let targetPath: string;

    if (folderUri) {
      targetPath = folderUri.fsPath;
    } else {
      const workspaceRoot = FileService.getWorkspaceRoot();
      if (!workspaceRoot) {
        throw new Error('No workspace folder found');
      }
      targetPath = workspaceRoot;
    }

    // Get project name
    const projectName = await vscode.window.showInputBox({
      prompt: 'Enter project name',
      value: path.basename(targetPath),
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Project name cannot be empty';
        }
        return null;
      }
    });

    if (!projectName) {
      return; // User cancelled
    }

    // Create directory structure
    await this.createProjectStructure(targetPath);

    // Create config
    const config = Project.createDefaultConfig(projectName.trim());
    await this.saveProjectConfig(targetPath, config);

    // Create default files
    await this.createDefaultFiles(targetPath, projectName.trim());

    // Refresh project
    await this.refreshProject();

    // Open STATUS.md
    const statusPath = path.join(targetPath, '.pm', 'STATUS.md');
    await FileService.openFileInEditor(statusPath);

    vscode.window.showInformationMessage(`Project Pilot project "${projectName}" initialized successfully!`);
  }

  private async createProjectStructure(rootPath: string): Promise<void> {
    // Create .pm directory
    const pmDir = path.join(rootPath, '.pm');
    await FileService.ensureDirectoryExists(pmDir);

    // Create directories
    for (const folder of Project.DEFAULT_FOLDERS) {
      const folderPath = path.join(pmDir, folder);
      await FileService.ensureDirectoryExists(folderPath);
      
      // Create README.md in each folder
      const readmePath = path.join(folderPath, 'README.md');
      const readmeContent = `# ${folder.charAt(0).toUpperCase() + folder.slice(1)}\n\n`;
      await FileService.writeFile(readmePath, readmeContent);
    }

    // Ensure .vscode directory exists
    const vscodeDir = path.join(rootPath, '.vscode');
    await FileService.ensureDirectoryExists(vscodeDir);
  }

  private async createDefaultFiles(rootPath: string, projectName: string): Promise<void> {
    const pmDir = path.join(rootPath, '.pm');

    // STATUS.md
    const statusContent = `# ${projectName} Status

## Current Sprint
**Goal:** 

**Progress:** 

## Tasks
- [ ] 

## Blockers
- 

## Next Steps
- 
`;
    await FileService.writeFile(path.join(pmDir, 'STATUS.md'), statusContent);

    // tasks.md
    const tasksContent = `# Tasks

## Backlog
- [ ] 

## In Progress
- [ ] 

## Done
- [x] Project structure initialized
`;
    await FileService.writeFile(path.join(pmDir, 'tasks.md'), tasksContent);

    // timeline.md
    const timelineContent = `# Timeline

## Milestones
- [ ] Project setup complete
- [ ] First deliverable ready

## Timeline
- ${new Date().toISOString().split('T')[0]}: Project initialized
`;
    await FileService.writeFile(path.join(pmDir, 'timeline.md'), timelineContent);
  }

  dispose(): void {
    this.projectChangeEmitter.dispose();
  }
} 