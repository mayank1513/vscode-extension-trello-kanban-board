import { ColumnType } from "@/interface";
import { HTMLProps, useId, useState } from "react";
import styles from "./column-list.module.scss";
import { useGlobalState } from "utils/context";
import { vscode } from "utils/vscode";

export default function ColumnHeader(props: HTMLProps<HTMLElement> & { column: ColumnType }) {
  const { state, setState } = useGlobalState();
  const { column, ...rest } = props;
  const [text, setText] = useState(column.title);
  const [isEditing, setIsEditing] = useState(false);
  const id = useId();
  const onBlur = () => {
    column.title = text.replace(/\s+/, " ");
    setText(column.title);
    setState({ ...state, columns: [...state.columns] });
    setIsEditing(false);
  };
  const removeColumn = () => {
    // todo: confirm before delete or show info message with undo button
    const tasks = state.tasks;
    column.tasksIds.forEach((tid) => {
      delete tasks[tid];
    });
    setState({ ...state, columns: state.columns.filter((c) => c !== column), tasks });
    vscode.toast(`${column.title} column and ${column.tasksIds.length} tasks deleted!`, "warn");
  };
  return (
    <header {...rest} className={styles.header}>
      <label htmlFor={id} onClick={() => setIsEditing(true)}>
        <input
          type="text"
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          placeholder="Add column title..."
          hidden={!isEditing}
        />
        <div hidden={isEditing} className={styles.headerContent}>
          {column.title || <span className={styles.placeholder}>Add column title</span>}{" "}
          <span className={styles.close} onClick={removeColumn}>
            ✖
          </span>
        </div>
      </label>
    </header>
  );
}
