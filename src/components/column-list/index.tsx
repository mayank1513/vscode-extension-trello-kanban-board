import styles from "./column-list.module.scss";
import { Droppable } from "react-beautiful-dnd";
import Column from "./column";
import { ColumnType } from "@/interface";
import { useGlobalState } from "utils/context";
import { nanoid } from "nanoid";
import { vscode } from "utils/vscode";

export default function ColumnList({ columns }: { columns: ColumnType[] }) {
  const { state, setState } = useGlobalState();
  const addColumn = () => {
    const id = "column-" + nanoid();
    setState({ ...state, columns: [...state.columns, { id, title: "", tasksIds: [] }] });
    vscode.toast(`New column created!`, "success");
    setTimeout(() => {
      const newColumnElement = document.getElementById(id);
      newColumnElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      newColumnElement?.getElementsByTagName("label")[0].click();
      setTimeout(() => {
        newColumnElement?.getElementsByTagName("input")[0].focus();
        newColumnElement?.getElementsByTagName("input")[0].click();
      }, 100);
    }, 100);
  };
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
