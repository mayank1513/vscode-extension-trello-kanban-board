export interface MessageType<T> {
  action: "save" | "load" | "info" | "warn" | "error";
  data?: T;
  text?: string;
}
