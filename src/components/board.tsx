import { useGlobalState } from "utils/context";
import styles from "./board.module.scss";
import ColumnList from "./column-list";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { ForkMe } from "@mayank1513/fork-me/server";
import "@mayank1513/fork-me/server/index.css";
import DrawerToggle from "./drawer-toggle";
import { useState } from "react";
import Drawer from "./drawer";
import { handleDragEnd } from "utils/drag";
import { ColorSwitch } from "nextjs-themes";

export default function Board() {
  const { state, setState } = useGlobalState();
  const [open, setOpen] = useState(false);

  const onDragEnd = (result: DropResult) => handleDragEnd(result, state, setState);
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={[styles.board, styles.dark, state.scope].join(" ")}>
        <header className={styles.header} data-testid="board-header">
          <div className={[styles.colorSwitch, styles[state.scope]].join(" ")}>
            <ColorSwitch />
          </div>
          <DrawerToggle toggle={() => setOpen(!open)} isOpen={open} />
          <h1>Trello Kanban Board: {state.scope}</h1>
          <hr />
        </header>
        <main className={styles.main}>
          <Drawer open={open} scope={state.scope} />
          <ColumnList columns={state.columns} />
        </main>
        {state.scope === "Browser" && <BrowserOnlyUI />}
      </div>
    </DragDropContext>
  );
}

function BrowserOnlyUI() {
  return (
    <>
      <ForkMe
        gitHubUrl="https://github.com/mayank1513/vscode-extension-trello-kanban-board"
        noAutoFork
        textColor="lightgreen"
        bgColor="orangered"
      />
      <a href="vscode:extension/mayank1513.trello-kanban-task-board" className={styles.install}>
        Install VSCode Extension
      </a>
    </>
  );
}
