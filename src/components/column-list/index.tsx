import styles from "./column-list.module.scss";
import { Droppable } from "react-beautiful-dnd";
import Column from "./column";
import { ColumnType } from "@/interface";

export default function ColumnList({ columns }: { columns: ColumnType[] }) {
  return (
    <Droppable droppableId={"columns"} direction="horizontal" type="column">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className={styles.columnList}>
          {columns.map((column, index) => (
            <Column key={column.id} column={column} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
