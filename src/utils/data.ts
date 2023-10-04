import { BoardType } from "@/interface";
import { createId } from "@paralleldrive/cuid2";

const taskId = "task-" + createId();
export const defaultBoard: BoardType = {
  scope: "",
  tasks: {
    [taskId]: {
      id: taskId,
      description: "Create new tasks\n\nTask can also contain lists\n\n- list item 1\n\n- list item 2",
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
