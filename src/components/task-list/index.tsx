import { ColumnType } from "@/interface";
import { Droppable } from "react-beautiful-dnd";
import styles from "./task-list.module.scss";
import Task from "./task";
import { useGlobalState } from "App";

export default function TaskList({ column }: { column: ColumnType }) {
  const { state } = useGlobalState();
  return (
    <Droppable droppableId={column.id} direction="vertical" type="task">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className={styles.taskList}>
          {column.tasksIds.map((taskId, index) => (
            <Task key={column.id} task={state.tasks[taskId]} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
