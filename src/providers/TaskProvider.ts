import * as vscode from 'vscode';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

export interface TaskQuickPickItem extends vscode.QuickPickItem {
  task: Task;
}

export class TaskProvider {
  private project: Project | null = null;

  constructor() {}

  setProject(project: Project | null): void {
    this.project = project;
  }

  async showAllTasks(): Promise<void> {
    if (!this.project) {
      vscode.window.showWarningMessage('No Project Pilot project detected in current workspace');
      return;
    }

    const tasks = this.project.tasks;
    if (tasks.length === 0) {
      vscode.window.showInformationMessage('No tasks found in project');
      return;
    }

    const items: TaskQuickPickItem[] = tasks.map(task => ({
      label: task.completed ? `✅ ${task.text}` : `⬜ ${task.text}`,
      description: this.getTaskDescription(task),
      detail: task.category ? `Category: ${task.category}` : undefined,
      task: task
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a task to toggle or view',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      await this.handleTaskSelection(selected.task);
    }
  }

  async showTasksByFolder(): Promise<void> {
    if (!this.project) {
      vscode.window.showWarningMessage('No Project Pilot project detected in current workspace');
      return;
    }

    // Group tasks by file/folder
    const tasksByFile = new Map<string, Task[]>();
    for (const task of this.project.tasks) {
      const fileName = this.getFileDisplayName(task.file);
      if (!tasksByFile.has(fileName)) {
        tasksByFile.set(fileName, []);
      }
      tasksByFile.get(fileName)!.push(task);
    }

    if (tasksByFile.size === 0) {
      vscode.window.showInformationMessage('No tasks found in project');
      return;
    }

    // First, let user select a file
    const fileItems = Array.from(tasksByFile.entries()).map(([fileName, tasks]) => ({
      label: fileName,
      description: `${tasks.filter(t => t.completed).length}/${tasks.length} completed`,
      detail: `${tasks.length} tasks`,
      fileName
    }));

    const selectedFile = await vscode.window.showQuickPick(fileItems, {
      placeHolder: 'Select a file to view tasks from'
    });

    if (!selectedFile) {
      return;
    }

    // Show tasks from selected file
    const fileTasks = tasksByFile.get(selectedFile.fileName)!;
    const taskItems: TaskQuickPickItem[] = fileTasks.map(task => ({
      label: task.completed ? `✅ ${task.text}` : `⬜ ${task.text}`,
      description: `Line ${task.line}`,
      detail: task.category ? `Category: ${task.category}` : undefined,
      task: task
    }));

    const selectedTask = await vscode.window.showQuickPick(taskItems, {
      placeHolder: `Tasks from ${selectedFile.fileName}`
    });

    if (selectedTask) {
      await this.handleTaskSelection(selectedTask.task);
    }
  }

  async addTask(): Promise<void> {
    if (!this.project) {
      vscode.window.showWarningMessage('No Project Pilot project detected in current workspace');
      return;
    }

    // Get task text from user
    const taskText = await vscode.window.showInputBox({
      placeHolder: 'Enter task description',
      prompt: 'What task would you like to add?'
    });

    if (!taskText) {
      return;
    }

    // Choose which file to add the task to
    const targetFiles = this.project.config.preferences.taskAggregation;
    let targetFile: string;

    if (targetFiles.length === 1) {
      targetFile = targetFiles[0];
    } else {
      const fileChoice = await vscode.window.showQuickPick(
        targetFiles.map(file => ({ label: file, file })),
        { placeHolder: 'Select file to add task to' }
      );
      
      if (!fileChoice) {
        return;
      }
      targetFile = fileChoice.file;
    }

    try {
      // Create task and add to file
      await this.addTaskToFile(targetFile, taskText);
      vscode.window.showInformationMessage(`Task added to ${targetFile}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to add task: ${error}`);
    }
  }

  async toggleTask(task?: Task): Promise<void> {
    if (!task && !this.project) {
      return;
    }

    try {
      if (task) {
        await this.toggleTaskCompletion(task);
      } else {
        // Show quick pick to select task to toggle
        await this.showAllTasks();
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to toggle task: ${error}`);
    }
  }

  private getTaskDescription(task: Task): string {
    const fileName = this.getFileDisplayName(task.file);
    return `${fileName}:${task.line}`;
  }

  private getFileDisplayName(filePath: string): string {
    // Extract just the filename from the full path
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] || filePath;
  }

  private async handleTaskSelection(task: Task): Promise<void> {
    const action = await vscode.window.showQuickPick([
      { label: task.completed ? 'Mark as incomplete' : 'Mark as complete', action: 'toggle' },
      { label: 'Go to task in file', action: 'goto' },
      { label: 'Edit task text', action: 'edit' }
    ], {
      placeHolder: 'What would you like to do with this task?'
    });

    if (!action) {
      return;
    }

    switch (action.action) {
      case 'toggle':
        await this.toggleTaskCompletion(task);
        break;
      case 'goto':
        await this.goToTask(task);
        break;
      case 'edit':
        await this.editTask(task);
        break;
    }
  }

  private async toggleTaskCompletion(task: Task): Promise<void> {
    // TODO: Implement task toggling in file
    // This would modify the markdown file to change [ ] to [x] or vice versa
    console.log(`Toggle task: ${task.text} from ${task.completed} to ${!task.completed}`);
  }

  private async goToTask(task: Task): Promise<void> {
    try {
      const uri = vscode.Uri.file(task.file);
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);
      
      // Jump to the task line
      const position = new vscode.Position(Math.max(0, task.line - 1), 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position));
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open task file: ${error}`);
    }
  }

  private async editTask(task: Task): Promise<void> {
    const newText = await vscode.window.showInputBox({
      value: task.text,
      prompt: 'Edit task text'
    });

    if (newText && newText !== task.text) {
      // TODO: Implement task text editing in file
      console.log(`Edit task from "${task.text}" to "${newText}"`);
    }
  }

  private async addTaskToFile(fileName: string, taskText: string): Promise<void> {
    // TODO: Implement adding task to markdown file
    // This would find the appropriate section and add - [ ] taskText
    console.log(`Add task "${taskText}" to ${fileName}`);
  }
} 