import { TaskType } from "@/interface";
import { Draggable } from "react-beautiful-dnd";

export default function Task({ task, index }: { task: TaskType; index: number }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps}>
          <p>{task.description}</p>
        </div>
      )}
    </Draggable>
  );
}
