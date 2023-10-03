import { ColumnType } from "@/interface";
import styles from "./column-list.module.scss";
import { Draggable, Droppable } from "react-beautiful-dnd";
import Task from "components/task";
import { useGlobalState } from "utils/context";

export default function Column({ column, index }: { column: ColumnType; index: number }) {
  const { state } = useGlobalState();
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef} className={styles.columnContainer}>
          <Droppable droppableId={column.id} direction="vertical">
            {(provided1) => (
              <div ref={provided1.innerRef} {...provided1.droppableProps} className={styles.columnDropzone}>
                <div className={styles.column}>
                  <header {...provided.dragHandleProps}>{column.title}</header>
                  <hr />
                  <div className={styles.taskList}>
                    {column.tasksIds.map((taskId, index) => (
                      <Task key={column.id} task={state.tasks[taskId]} index={index} />
                    ))}
                    {provided1.placeholder}
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
