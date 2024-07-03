import { ColumnType, TaskType } from "@/interface";
import styles from "./column-list.module.scss";
import { Draggable, Droppable } from "react-beautiful-dnd";
import Task from "components/task";
import { useGlobalState } from "utils/context";
import { nanoid } from "nanoid";
import ColumnHeader from "./column-header";
import { vscode } from "utils/vscode";
import { useRef } from "react";

export default function Column({ column, index }: { column: ColumnType; index: number }) {
  const { state, setState } = useGlobalState();
  const listRef = useRef<HTMLUListElement>(null);
  const addTask = () => {
    const newTask: TaskType = {
      id: nanoid(),
      description: "",
      columnId: column.id,
    };
    column.tasksIds = [...column.tasksIds, newTask.id];
    setState({ ...state, tasks: { ...state.tasks, [newTask.id]: newTask }, columns: [...state.columns] });
    vscode.toast(`New task created in ${column?.title} column!`, "success");
    setTimeout(() => {
      // listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      const newTaskElement = listRef.current?.children[listRef.current.children.length - 1] as HTMLLabelElement;
      newTaskElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      newTaskElement?.getElementsByTagName("button")[0].click();
      setTimeout(() => {
        newTaskElement?.getElementsByTagName("textarea")[0].focus();
        newTaskElement?.getElementsByTagName("textarea")[0].click();
        setTimeout(
          () => newTaskElement?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }),
          100
        );
      }, 50);
    }, 250);
  };
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          id={column.id}
          ref={provided.innerRef}
          className={styles.columnContainer}
          data-testid={`column-${index}`}>
          <Droppable droppableId={column.id} direction="vertical">
            {(provided1) => (
              <div ref={provided1.innerRef} {...provided1.droppableProps} className={styles.columnDropzone}>
                <div className={styles.column}>
                  <ColumnHeader column={column} {...provided.dragHandleProps} />
                  <hr />
                  <ul className={styles.taskList} ref={listRef}>
                    {column.tasksIds.map((taskId, index) => (
                      <Task key={taskId} task={state.tasks[taskId]} index={index} />
                    ))}
                    {provided1.placeholder}
                  </ul>
                  <button className={styles.addTask} onClick={addTask}>
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
