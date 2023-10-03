import { BoardType } from "@/interface";
import { createId } from "@paralleldrive/cuid2";

const taskId = "task-" + createId();
export const defaultBoard: BoardType = {
  scope: "",
  tasks: {
    [taskId]: {
      id: taskId,
      description: "Move me to another column",
      columnId: "column-todo",
    },
  },
  columns: [
    {
      id: "column-todo",
      title: "To do",
      tasksIds: [taskId],
    },
    {
      id: "column-doing",
      title: "Doing",
      tasksIds: [],
    },
    {
      id: "column-done",
      title: "Done",
      tasksIds: [],
    },
  ],
};
