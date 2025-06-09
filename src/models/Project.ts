import { Uri } from 'vscode';
import { Task } from './Task';
import { Log } from './Log';

export interface ProjectConfig {
  version: string;
  projectName: string;
  customFolders: Record<string, string>;
  preferences: {
    autoCreateLogs: boolean;
    taskAggregation: string[];
    logTemplate?: string;
  };
}

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  lastLogDate?: Date;
  lastLogDays: number;
  consecutiveLogDays: number;
  totalLogs: number;
}

export class Project {
  public readonly rootPath: string;
  public readonly name: string;
  public config: ProjectConfig;
  private _tasks: Task[] = [];
  private _logs: Log[] = [];
  private _metrics?: ProjectMetrics;

  constructor(rootPath: string, config: ProjectConfig) {
    this.rootPath = rootPath;
    this.name = config.projectName;
    this.config = config;
  }

  static readonly DEFAULT_FOLDERS = [
    '0-planning',
    '1-research',
    '2-assets', 
    '3-development',
    '4-deliverables',
    '5-logs'
  ];

  static readonly DEFAULT_FILES = [
    'STATUS.md',
    'tasks.md',
    'timeline.md'
  ];

  get uri(): Uri {
    return Uri.file(this.rootPath);
  }

  get configPath(): string {
    return `${this.rootPath}/.vscode/project-pilot.json`;
  }

  get tasks(): Task[] {
    return this._tasks;
  }

  set tasks(tasks: Task[]) {
    this._tasks = tasks;
    this._metrics = undefined; // Reset metrics cache
  }

  get logs(): Log[] {
    return this._logs;
  }

  set logs(logs: Log[]) {
    this._logs = logs;
    this._metrics = undefined; // Reset metrics cache
  }

  get metrics(): ProjectMetrics {
    if (!this._metrics) {
      this._metrics = this.calculateMetrics();
    }
    return this._metrics;
  }

  private calculateMetrics(): ProjectMetrics {
    const completedTasks = this._tasks.filter(task => task.completed).length;
    const sortedLogs = this._logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    const lastLog = sortedLogs[0];
    
    let consecutiveLogDays = 0;
    if (lastLog) {
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastLog.date.getTime()) / (1000 * 60 * 60 * 24));
      
      // Count consecutive days from most recent
      let currentDate = lastLog.date;
      for (const log of sortedLogs) {
        const logDaysDiff = Math.floor((currentDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24));
        if (logDaysDiff <= 1) {
          consecutiveLogDays++;
          currentDate = log.date;
        } else {
          break;
        }
      }
    }

    return {
      totalTasks: this._tasks.length,
      completedTasks,
      lastLogDate: lastLog?.date,
      lastLogDays: lastLog ? Math.floor((Date.now() - lastLog.date.getTime()) / (1000 * 60 * 60 * 24)) : -1,
      consecutiveLogDays,
      totalLogs: this._logs.length
    };
  }

  getTasksByFile(filePath: string): Task[] {
    return this._tasks.filter(task => task.file === filePath);
  }

  getTasksByCategory(category: string): Task[] {
    return this._tasks.filter(task => task.category === category);
  }

  static createDefaultConfig(projectName: string): ProjectConfig {
    return {
      version: '1.0.0',
      projectName,
      customFolders: {},
      preferences: {
        autoCreateLogs: true,
        taskAggregation: ['tasks.md', 'STATUS.md']
      }
    };
  }
} 