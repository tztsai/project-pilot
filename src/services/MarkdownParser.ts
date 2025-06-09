import { Task, TaskModel } from '../models/Task';
import { FileService } from './FileService';

export class MarkdownParser {
  
  static async parseTasksFromFile(filePath: string): Promise<Task[]> {
    try {
      const content = await FileService.readFile(filePath);
      return this.parseTasksFromContent(content, filePath);
    } catch (error) {
      console.error(`Failed to parse tasks from ${filePath}:`, error);
      return [];
    }
  }

  static parseTasksFromContent(content: string, filePath: string): Task[] {
    const tasks: Task[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const task = TaskModel.fromMarkdownLine(line, filePath, index + 1);
      if (task) {
        tasks.push(task);
      }
    });

    return tasks;
  }

  static async updateTaskInFile(task: Task, newCompleted: boolean): Promise<void> {
    try {
      const content = await FileService.readFile(task.file);
      const lines = content.split('\n');
      
      if (task.line <= lines.length) {
        const oldLine = lines[task.line - 1];
        const newLine = this.updateTaskLine(oldLine, newCompleted);
        lines[task.line - 1] = newLine;
        
        const updatedContent = lines.join('\n');
        await FileService.writeFile(task.file, updatedContent);
      }
    } catch (error) {
      throw new Error(`Failed to update task in ${task.file}: ${error}`);
    }
  }

  static updateTaskLine(line: string, completed: boolean): string {
    const checkboxRegex = /^(\s*-\s+)\[([ x])\](\s+.*)$/;
    const match = line.match(checkboxRegex);
    
    if (match) {
      const [, prefix, , suffix] = match;
      const checkState = completed ? 'x' : ' ';
      return `${prefix}[${checkState}]${suffix}`;
    }
    
    return line; // Return unchanged if not a task line
  }

  static async addTaskToFile(filePath: string, taskText: string, section?: string): Promise<Task> {
    try {
      const content = await FileService.readFile(filePath);
      const lines = content.split('\n');
      
      let insertIndex = lines.length;
      
      if (section) {
        // Find the section to insert the task
        const sectionIndex = lines.findIndex(line => 
          line.trim().toLowerCase().startsWith(`## ${section.toLowerCase()}`)
        );
        
        if (sectionIndex !== -1) {
          // Find the end of the section or next section
          let endIndex = sectionIndex + 1;
          while (endIndex < lines.length && !lines[endIndex].trim().startsWith('##')) {
            endIndex++;
          }
          insertIndex = endIndex;
        }
      }
      
      const taskLine = `- [ ] ${taskText}`;
      lines.splice(insertIndex, 0, taskLine);
      
      const updatedContent = lines.join('\n');
      await FileService.writeFile(filePath, updatedContent);
      
      // Return the created task
      return new TaskModel({
        text: taskText,
        completed: false,
        file: filePath,
        line: insertIndex + 1
      });
    } catch (error) {
      throw new Error(`Failed to add task to ${filePath}: ${error}`);
    }
  }

  static async findAllTaskFiles(rootPath: string, patterns: string[]): Promise<string[]> {
    const taskFiles: string[] = [];
    
    for (const pattern of patterns) {
      const files = await FileService.findFiles(rootPath, [pattern]);
      taskFiles.push(...files);
    }
    
    return [...new Set(taskFiles)]; // Remove duplicates
  }

  static async aggregateTasksFromProject(rootPath: string, taskFiles: string[]): Promise<Task[]> {
    const allTasks: Task[] = [];
    
    for (const filePath of taskFiles) {
      const tasks = await this.parseTasksFromFile(filePath);
      allTasks.push(...tasks);
    }
    
    return allTasks;
  }

  /**
   * Extract sections from markdown content
   */
  static extractSections(content: string): Record<string, string[]> {
    const sections: Record<string, string[]> = {};
    const lines = content.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        currentSection = trimmed.substring(3).toLowerCase();
        sections[currentSection] = [];
      } else if (currentSection && trimmed) {
        sections[currentSection].push(line);
      }
    }
    
    return sections;
  }

  /**
   * Get task completion statistics from content
   */
  static getTaskStats(content: string): { total: number; completed: number } {
    const tasks = this.parseTasksFromContent(content, '');
    const completed = tasks.filter(task => task.completed).length;
    
    return {
      total: tasks.length,
      completed
    };
  }
} 