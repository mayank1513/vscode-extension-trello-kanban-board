import styles from "./column-list.module.scss";
import { Droppable } from "react-beautiful-dnd";
import Column from "./column";
import { ColumnType } from "@/interface";
import { useGlobalState } from "utils/context";
import { createId } from "@paralleldrive/cuid2";

export default function ColumnList({ columns }: { columns: ColumnType[] }) {
  const { state, setState } = useGlobalState();
  const addColumn = () =>
    setState({ ...state, columns: [...state.columns, { id: "column-" + createId(), title: "", tasksIds: [] }] });
  return (
    <Droppable droppableId={"columns"} direction="horizontal" type="column">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className={styles.columnList}>
          {columns.map((column, index) => (
            <Column key={column.id} column={column} index={index} />
          ))}
          {provided.placeholder}
          <button className={styles.addColumn} onClick={addColumn}>
            Add Column
          </button>
        </div>
      )}
    </Droppable>
  );
}
