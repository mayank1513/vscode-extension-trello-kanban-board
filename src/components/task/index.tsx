import { TaskType } from "@/interface";
import { useId, useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import ReactMarkdown from "react-markdown";
import { useGlobalState } from "utils/context";
import styles from "./task.module.scss";

export default function Task({ task, index }: { task: TaskType; index: number }) {
  const { state, setState } = useGlobalState();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(task.description);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const onBlur = () => {
    task.description = text.replace(/ +/, " ").replace(/\n+/g, "\n\n");
    setText(task.description);
    console.log("dec - ", task.description);
    setState({ ...state, tasks: { ...state.tasks } });
    setIsEditing(false);
  };
  const resizeTextArea = () => {
    const target = textareaRef.current;
    if (!target) return;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <label
          onClick={() => {
            setIsEditing(true);
            resizeTextArea();
          }}
          htmlFor={id}
          ref={provided.innerRef}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
          className={styles.task}>
          <textarea
            id={id}
            value={text}
            ref={textareaRef}
            onChange={(e) => {
              setText(e.target.value);
              resizeTextArea();
            }}
            onBlur={onBlur}
            placeholder="Enter task description in Markdown format"
            hidden={!isEditing}
          />
          {!isEditing &&
            (task.description.trim() ? (
              <ReactMarkdown>{task.description}</ReactMarkdown>
            ) : (
              <p className={styles.placeholder}>Enter task description in Markdown format.</p>
            ))}
        </label>
      )}
    </Draggable>
  );
}
