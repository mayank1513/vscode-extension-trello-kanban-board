import { ColumnType } from "@/interface";
import { HTMLProps, useId, useState } from "react";
import styles from "./column-list.module.scss";
import { useGlobalState } from "utils/context";

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
          <span className={styles.close}>✖</span>
        </div>
      </label>
    </header>
  );
}
