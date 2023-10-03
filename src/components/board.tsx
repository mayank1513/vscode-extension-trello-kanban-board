import { useGlobalState } from "utils/context";
import styles from "./board.module.scss";
import ColumnList from "./column-list";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

export default function Board() {
  const { setState, state } = useGlobalState();

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    /** column id always starts with "column-" */
    const columns = state.columns;
    if (draggableId.startsWith("column-")) {
      const column = columns.splice(source.index, 1)[0];
      columns.splice(destination.index, 0, column);
      setState({ ...state, columns: [...state.columns] });
    } else {
      const columns = [...state.columns];
      const sourceCol = columns.find((c) => c.id === source.droppableId);
      let destinationCol;
      if (destination.droppableId === "columns") {
        destinationCol = columns[Math.min(destination.index, columns.length - 1)];
      } else {
        destinationCol = columns.find((c) => c.id === destination.droppableId);
      }
      const taskId = sourceCol?.tasksIds.splice(source.index, 1)[0];
      const tasks = { ...state.tasks };
      if (taskId) {
        tasks[taskId].columnId = destination.droppableId;
        destinationCol?.tasksIds.splice(destination.index, 0, taskId);
        setState({ ...state, columns });
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={[styles.board, styles.dark].join(" ")}>
        <header className={styles.header}>
          <h1>Trello Kanban Board: {state.scope}</h1>
          <hr />
        </header>
        <ColumnList columns={state.columns} />
      </div>
    </DragDropContext>
  );
}
