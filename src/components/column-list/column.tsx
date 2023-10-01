import { ColumnType } from "@/interface";
import styles from "./column-list.module.scss";
import { Draggable } from "react-beautiful-dnd";
import TaskList from "components/task-list";

export default function Column({ column, index }: { column: ColumnType; index: number }) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div {...provided.draggableProps} ref={provided.innerRef} className={styles.column}>
          <header {...provided.dragHandleProps}>{column.title}</header>
          <hr />
          <TaskList column={column} />
        </div>
      )}
    </Draggable>
  );
}
