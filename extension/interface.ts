export interface MessageType {
  action: "save" | "load" | "info" | "warn" | "error";
  data?: BoardType;
  text?: string;
}

export interface TaskType {
  id: string;
  description: string;
}

export interface ColumnType {
  id: string;
  title: string;
  description?: string;
  archived?: boolean;
  tasksIds: string[];
}

export interface BoardType {
  theme?: string;
  columns: ColumnType[];
  tasks: TaskType[];
}
