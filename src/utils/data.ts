import { BoardType } from "@/interface";
import { createId } from "@paralleldrive/cuid2";

const taskId = createId();
export const defaultBoard: BoardType = {
  tasks: [
    {
      id: taskId,
      description: "Move me to another column",
    },
  ],
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
