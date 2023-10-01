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

    if (draggableId.startsWith("column-")) {
      const columns = state.columns;
      const column = columns.splice(source.index, 1)[0];
      columns.splice(destination.index, 0, column);
      setState({ ...state, columns: [...state.columns] });
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
