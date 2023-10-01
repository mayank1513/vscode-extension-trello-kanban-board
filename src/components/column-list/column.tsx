import { ColumnType } from "@/interface";
import styles from "./column-list.module.scss";
import { Draggable } from "react-beautiful-dnd";

export default function Column({ column, index }: { column: ColumnType; index: number }) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={styles.column}>
          <header>{column.title}</header>
          <hr />
        </div>
      )}
    </Draggable>
  );
}
