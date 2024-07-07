import { TaskType } from "@/interface";
import { RefObject, useId, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useGlobalState } from "utils/context";
import styles from "./task.module.scss";
import { vscode } from "utils/vscode";

function resizeTextArea(textareaRef: RefObject<HTMLTextAreaElement>) {
  const target = textareaRef.current;
  if (!target) return;
  target.style.height = "auto";
  target.style.height = `${target.scrollHeight}px`;
}

export default function Task({ task, index }: { task: TaskType; index: number }) {
  const { state, setState } = useGlobalState();
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  const removeTask = () => {
    const tasks = { ...state.tasks };
    delete tasks[task.id];
    const columns = [...state.columns];
    const column = columns.find((c) => c.id === task.columnId);
    if (column) {
      column.tasksIds = column.tasksIds.filter((id) => id !== task.id);
    }
    setState({ ...state, tasks, columns });
    vscode.toast("Task deleted!", "success");
  };
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => {
        if (snapshot.isDragging && provided.draggableProps.style?.transform)
          provided.draggableProps.style.transform += " rotate(5deg)";
        return (
          <label
            htmlFor={id}
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={[styles.task, isEditing ? styles.active : ""].join(" ")}>
            <header {...provided.dragHandleProps}>
              <span>∘∘∘</span>
              <button
                onClick={() => {
                  setIsEditing(true);
                  if (textareaRef.current?.value) {
                    textareaRef.current.value = "hk";
                    textareaRef.current.value = task.description;
                  }
                  setTimeout(() => {
                    textareaRef.current && textareaRef.current.focus();
                    resizeTextArea(textareaRef);
                  }, 100);
                }}>
                🖉
              </button>
              <button className={styles.close} onClick={removeTask}>
                ✖
              </button>
            </header>
            <textarea
              id={id}
              value={task.description}
              ref={textareaRef}
              onChange={(e) => {
                task.description = e.target.value.replace(/ +/, " ").replace(/\n\n+/g, "\n\n");
                setState({ ...state, tasks: { ...state.tasks } });
                resizeTextArea(textareaRef);
              }}
              onBlur={() => setIsEditing(false)}
              placeholder="Enter task description in Markdown format"
              hidden={!isEditing}
            />
            {!isEditing &&
              (task.description.trim() ? (
                <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                  {task.description.replace(/\n+/g, "\n\n")}
                </ReactMarkdown>
              ) : (
                <p className={styles.placeholder}>Enter task description in Markdown format.</p>
              ))}
          </label>
        );
      }}
    </Draggable>
  );
}
