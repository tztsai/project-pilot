import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import { Stats } from 'fs';
import * as path from 'path';

export class FileService {
  
  static async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await this.ensureDirectoryExists(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  static async appendFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.appendFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to append to file ${filePath}: ${error}`);
    }
  }

  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  static async listFiles(dirPath: string, pattern?: RegExp): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let files = entries
        .filter(entry => entry.isFile())
        .map(entry => path.join(dirPath, entry.name));
      
      if (pattern) {
        files = files.filter(file => pattern.test(file));
      }
      
      return files;
    } catch (error) {
      throw new Error(`Failed to list files in ${dirPath}: ${error}`);
    }
  }

  static async listDirectories(dirPath: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(dirPath, entry.name));
    } catch (error) {
      throw new Error(`Failed to list directories in ${dirPath}: ${error}`);
    }
  }

  static async findFiles(rootPath: string, patterns: string[]): Promise<string[]> {
    const files: string[] = [];
    
    try {
      for (const pattern of patterns) {
        const globPattern = new vscode.RelativePattern(rootPath, pattern);
        const foundFiles = await vscode.workspace.findFiles(globPattern);
        files.push(...foundFiles.map(uri => uri.fsPath));
      }
      
      return [...new Set(files)]; // Remove duplicates
    } catch (error) {
      throw new Error(`Failed to find files in ${rootPath}: ${error}`);
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error}`);
    }
  }

  static async copyFile(source: string, destination: string): Promise<void> {
    try {
      await this.ensureDirectoryExists(path.dirname(destination));
      await fs.copyFile(source, destination);
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${error}`);
    }
  }

  static async getStats(filePath: string): Promise<Stats> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to get stats for ${filePath}: ${error}`);
    }
  }

  static async openFileInEditor(filePath: string): Promise<vscode.TextEditor> {
    try {
      const uri = vscode.Uri.file(filePath);
      const document = await vscode.workspace.openTextDocument(uri);
      return await vscode.window.showTextDocument(document);
    } catch (error) {
      throw new Error(`Failed to open file ${filePath} in editor: ${error}`);
    }
  }

  static async showFileInExplorer(filePath: string): Promise<void> {
    try {
      const uri = vscode.Uri.file(filePath);
      await vscode.commands.executeCommand('revealFileInOS', uri);
    } catch (error) {
      throw new Error(`Failed to show file ${filePath} in explorer: ${error}`);
    }
  }

  /**
   * Watch for file changes in a directory
   */
  static createFileWatcher(
    pattern: string,
    onChange?: (uri: vscode.Uri) => void,
    onCreate?: (uri: vscode.Uri) => void,
    onDelete?: (uri: vscode.Uri) => void
  ): vscode.FileSystemWatcher {
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    
    if (onChange) {
      watcher.onDidChange(onChange);
    }
    if (onCreate) {
      watcher.onDidCreate(onCreate);
    }
    if (onDelete) {
      watcher.onDidDelete(onDelete);
    }
    
    return watcher;
  }

  /**
   * Get relative path from workspace root
   */
  static getRelativePath(filePath: string): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return filePath;
    }
    
    return path.relative(workspaceFolder.uri.fsPath, filePath);
  }

  /**
   * Get workspace root path
   */
  static getWorkspaceRoot(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  }
} 