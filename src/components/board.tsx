import { useGlobalState } from "App";
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
      const sourceCol = columns.find((c) => c.id === source.droppableId);
      let destinationCol;
      if (destination.droppableId === "columns") {
        destinationCol = columns[Math.min(destination.index, columns.length - 1)];
      } else {
        destinationCol = columns.find((c) => c.id === destination.droppableId);
      }
      const task = sourceCol?.tasksIds.splice(source.index, 1)[0];
      if (task) {
        destinationCol?.tasksIds.splice(destination.index, 0, task);
        setState({ ...state, columns: [...state.columns] });
      }
    }
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={[styles.board, styles.dark].join(" ")}>
        <ColumnList columns={state.columns} />
      </div>
    </DragDropContext>
  );
}
