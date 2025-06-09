export interface Task {
  id: string;
  text: string;
  completed: boolean;
  file: string;
  line: number;
  category?: string;
  created?: Date;
  updated?: Date;
}

export class TaskModel implements Task {
  public id: string;
  public text: string;
  public completed: boolean;
  public file: string;
  public line: number;
  public category?: string;
  public created: Date;
  public updated: Date;

  constructor(data: Omit<Task, 'id' | 'created' | 'updated'> & { id?: string }) {
    this.id = data.id || this.generateId();
    this.text = data.text;
    this.completed = data.completed;
    this.file = data.file;
    this.line = data.line;
    this.category = data.category;
    this.created = new Date();
    this.updated = new Date();
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toggle(): void {
    this.completed = !this.completed;
    this.updated = new Date();
  }

  updateText(newText: string): void {
    this.text = newText;
    this.updated = new Date();
  }

  updateLine(newLine: number): void {
    this.line = newLine;
    this.updated = new Date();
  }

  getMarkdownCheckbox(): string {
    return this.completed ? '- [x]' : '- [ ]';
  }

  static fromMarkdownLine(line: string, file: string, lineNumber: number): TaskModel | null {
    const checkboxRegex = /^(\s*)-\s+\[([ x])\]\s+(.+)$/;
    const match = line.match(checkboxRegex);
    
    if (!match) {
      return null;
    }

    const [, , checkState, text] = match;
    const completed = checkState.toLowerCase() === 'x';

    return new TaskModel({
      text: text.trim(),
      completed,
      file,
      line: lineNumber
    });
  }

  toMarkdownLine(): string {
    return `${this.getMarkdownCheckbox()} ${this.text}`;
  }
} 