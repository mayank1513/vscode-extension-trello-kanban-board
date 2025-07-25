import { ColumnType } from "@/interface";
import { HTMLProps, useId, useState } from "react";
import styles from "./column-list.module.scss";
import { useGlobalState } from "utils/context";
import { vscode } from "utils/vscode";
import { ColorSelector } from "components/color-selector";
import { Check, Palette, Pencil, X } from "lucide-react";

export default function ColumnHeader(props: HTMLProps<HTMLElement> & { column: ColumnType }) {
  const { state, setState } = useGlobalState();
  const { column, ...rest } = props;
  const [text, setText] = useState(column.title);
  const [showColorSelector, setShowColorSelector] = useState(false);
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
    vscode.toast(`"${column.title}" column and ${column.tasksIds.length} tasks deleted!`, "warn");
  };
  const setColor = (color: string) => {
    column.color = color;
    setState({ ...state, columns: [...state.columns] });
    setShowColorSelector(false);
  };
  return (
    <>
      <header {...rest} className={styles.header}>
        <label htmlFor={id} onDoubleClick={() => setIsEditing(true)}>
          <div className={styles.headerContent}>
            <input
              type="text"
              id={id}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={onBlur}
              placeholder="Add column title..."
              hidden={!isEditing}
            />
            {isEditing ? null : column.title || <span className={styles.placeholder}>Add column title</span>}
            <div className="grow"></div>
            <button onClick={() => setIsEditing(true)}>
              <Pencil />
            </button>
            <button onClick={() => setShowColorSelector(true)}>
              <Palette />
            </button>
            <button className={isEditing ? styles.check : styles.close} onClick={isEditing ? onBlur : removeColumn}>
              {isEditing ? <Check /> : <X />}
            </button>
          </div>
        </label>
      </header>
      {showColorSelector && (
        <ColorSelector color={column.color} setColor={setColor} onClose={() => setShowColorSelector(false)} />
      )}
    </>
  );
}
