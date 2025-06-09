import * as vscode from 'vscode';
import * as path from 'path';
import { Project } from '../models/Project';

export class ProjectItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly filePath?: string,
    public readonly itemType?: 'folder' | 'file' | 'root',
    public readonly taskCount?: number
  ) {
    super(label, collapsibleState);
    
    this.tooltip = this.getTooltip();
    this.contextValue = this.getContextValue();
    this.iconPath = this.getIconPath();
    
    if (filePath && itemType === 'file') {
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(filePath)]
      };
    }
  }

  private getTooltip(): string {
    if (this.itemType === 'file' && this.taskCount !== undefined) {
      return `${this.label} (${this.taskCount} tasks)`;
    }
    return this.label;
  }

  private getContextValue(): string {
    switch (this.itemType) {
      case 'folder':
        return 'projectFolder';
      case 'file':
        return 'projectFile';
      default:
        return 'projectItem';
    }
  }

  private getIconPath(): vscode.ThemeIcon {
    if (this.itemType === 'folder') {
      return new vscode.ThemeIcon('folder');
    } else if (this.itemType === 'file') {
      if (this.label.endsWith('.md')) {
        return new vscode.ThemeIcon('markdown');
      }
      return new vscode.ThemeIcon('file');
    }
    return new vscode.ThemeIcon('folder-library');
  }
}

export class ProjectTreeProvider implements vscode.TreeDataProvider<ProjectItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ProjectItem | undefined | null | void> = new vscode.EventEmitter<ProjectItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ProjectItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private project: Project | null = null;

  constructor() {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  setProject(project: Project | null): void {
    this.project = project;
    this.refresh();
  }

  getTreeItem(element: ProjectItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ProjectItem): Thenable<ProjectItem[]> {
    if (!this.project) {
      return Promise.resolve([]);
    }

    if (!element) {
      // Root level - show main project structure
      return Promise.resolve(this.getProjectStructure());
    }

    if (element.filePath && element.itemType === 'folder') {
      return Promise.resolve(this.getFolderContents(element.filePath));
    }

    return Promise.resolve([]);
  }

  private getProjectStructure(): ProjectItem[] {
    if (!this.project) {
      return [];
    }

    const items: ProjectItem[] = [];

    // Add structured folders
    for (const folder of Project.DEFAULT_FOLDERS) {
      const folderPath = path.join(this.project.rootPath, '.pm', folder);
      items.push(new ProjectItem(
        folder,
        vscode.TreeItemCollapsibleState.Collapsed,
        folderPath,
        'folder'
      ));
    }

    // Add main project files
    for (const file of Project.DEFAULT_FILES) {
      const filePath = path.join(this.project.rootPath, '.pm', file);
      const taskCount = this.getTaskCountForFile(filePath);
      items.push(new ProjectItem(
        file,
        vscode.TreeItemCollapsibleState.None,
        filePath,
        'file',
        taskCount
      ));
    }

    return items;
  }

  private getFolderContents(folderPath: string): ProjectItem[] {
    // TODO: Implement folder content reading
    // This would scan the folder and return child items
    // For now, return empty array
    return [];
  }

  private getTaskCountForFile(filePath: string): number {
    if (!this.project) {
      return 0;
    }
    return this.project.getTasksByFile(filePath).length;
  }
} 