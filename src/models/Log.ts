import { Task } from './Task';

export interface LogEntry {
  date: Date;
  file: string;
  title: string;
  goals: Task[];
  progress: string[];
  notes: string[];
  tomorrow: Task[];
}

export class Log implements LogEntry {
  public date: Date;
  public file: string;
  public title: string;
  public goals: Task[] = [];
  public progress: string[] = [];
  public notes: string[] = [];
  public tomorrow: Task[] = [];

  constructor(date: Date, file: string) {
    this.date = date;
    this.file = file;
    this.title = this.formatTitle(date);
  }

  private formatTitle(date: Date): string {
    return `Daily Log - ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}`;
  }

  get fileName(): string {
    return `${this.formatDateForFile(this.date)}.md`;
  }

  private formatDateForFile(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  addGoal(goal: Task): void {
    this.goals.push(goal);
  }

  addProgress(item: string): void {
    this.progress.push(item);
  }

  addNote(note: string): void {
    this.notes.push(note);
  }

  addTomorrowTask(task: Task): void {
    this.tomorrow.push(task);
  }

  get summary(): string {
    const goalCount = this.goals.length;
    const completedGoals = this.goals.filter(g => g.completed).length;
    const progressCount = this.progress.length;
    
    return `${completedGoals}/${goalCount} goals, ${progressCount} progress items`;
  }

  static createTemplate(date: Date = new Date()): string {
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    });

    return `# Daily Log - ${formattedDate}

## Goals
- [ ] 

## Progress
- 

## Notes
- 

## Tomorrow
- [ ] 
`;
  }

  static fromFile(content: string, file: string, date: Date): Log {
    const log = new Log(date, file);
    
    // Parse the markdown content to extract goals, progress, notes, etc.
    const lines = content.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        currentSection = trimmed.substring(3).toLowerCase();
        continue;
      }
      
      if (trimmed && !trimmed.startsWith('#')) {
        switch (currentSection) {
          case 'goals':
            if (trimmed.startsWith('- [')) {
              // Parse as task
              const task = this.parseTaskLine(trimmed, file, lines.indexOf(line));
              if (task) {
                log.addGoal(task);
              }
            }
            break;
          case 'progress':
            if (trimmed.startsWith('- ')) {
              log.addProgress(trimmed.substring(2));
            }
            break;
          case 'notes':
            if (trimmed.startsWith('- ')) {
              log.addNote(trimmed.substring(2));
            }
            break;
          case 'tomorrow':
            if (trimmed.startsWith('- [')) {
              const task = this.parseTaskLine(trimmed, file, lines.indexOf(line));
              if (task) {
                log.addTomorrowTask(task);
              }
            }
            break;
        }
      }
    }
    
    return log;
  }

  private static parseTaskLine(line: string, file: string, lineNumber: number): Task | null {
    const checkboxRegex = /^-\s+\[([ x])\]\s+(.+)$/;
    const match = line.match(checkboxRegex);
    
    if (!match) {
      return null;
    }

    const [, checkState, text] = match;
    const completed = checkState.toLowerCase() === 'x';

    return {
      id: `log-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      completed,
      file,
      line: lineNumber
    };
  }
} 