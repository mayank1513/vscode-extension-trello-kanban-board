import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "App";
import { afterEach, beforeEach, describe, test, vi } from "vitest";
import boardStyles from "./components/board.module.scss";
import taskStyles from "./components/task/task.module.scss";
import columnListStyles from "./components/column-list/column-list.module.scss";
import Drawer from "components/drawer";
import { scrollIntoViewMock } from "../vitest.setup";
import { handleDragEnd } from "utils/drag";
import { defaultBoard, taskId } from "utils/data";
import { DropReason } from "react-beautiful-dnd";

describe("Test Board", () => {
  afterEach(cleanup);
  beforeEach(async () => {
    await act(async () => render(<App />));
  });
  test("Board Header", ({ expect }) => {
    const header = screen.getByTestId("board-header");
    expect(header.textContent).toContain("Trello Kanban Board");
    expect(header.className).toBe(boardStyles.header);
  });
  test("Install VSCode Extension button", async ({ expect }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(screen.queryByText("Install VSCode Extension")).toBeInTheDocument();
  });

  test("Create a new column", ({ expect }) => {
    act(() => fireEvent.click(screen.getByText("Add Column")));
    /** for some reason renderHook is always returning null state */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(screen.queryByTestId("column-3")).toBeInTheDocument();
  });

  test("Update column title", ({ expect }) => {
    const headerEl = screen.getByTestId("column-3").getElementsByClassName(columnListStyles.header)[0];
    act(() => fireEvent.click(headerEl?.getElementsByTagName("label")[0]));
    act(() => fireEvent.change(headerEl?.getElementsByTagName("input")[0], { target: { value: "New Column" } }));
    act(() => fireEvent.blur(headerEl?.getElementsByTagName("input")[0]));
    expect(headerEl.textContent).toContain("New Column");
  });

  test("Create new tasks", ({ expect }) => {
    const columnEl = screen.getByTestId("column-3");
    act(() => fireEvent.click(columnEl.getElementsByTagName("button")[0]));
    act(() => fireEvent.click(columnEl.getElementsByTagName("button")[0]));
    expect(columnEl.getElementsByClassName(taskStyles.task).length).toBe(2);
  });

  test("Remove column", ({ expect }) => {
    const columnEl = screen.getByTestId("column-3");
    act(() => fireEvent.click(columnEl.getElementsByClassName(columnListStyles.close)[0]));
    /** for some reason renderHook is always returning null state */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(screen.queryByTestId("column-3")).not.toBeInTheDocument();
  });

  test("Create a new task", async ({ expect }) => {
    const columnEl = screen.getByTestId("column-0");
    act(() => fireEvent.click(columnEl.getElementsByTagName("button")[0]));
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(columnEl.getElementsByClassName(taskStyles.task).length).toBe(2);
    expect(scrollIntoViewMock).toBeCalled();
  });

  /** Todo: drop on another column or position */
  test("Move task", async ({ expect }) => {
    const columnEl = screen.getByTestId("column-0");
    const taskEl = columnEl.getElementsByClassName(taskStyles.task)[0];
    // simulate dragging -- not very effective
    act(() => fireEvent.mouseDown(taskEl, { clientX: 100, clientY: 150 }));
    act(() => fireEvent.mouseMove(taskEl, { clientX: 450, clientY: 500 }));
    act(() => fireEvent.mouseMove(taskEl, { clientX: 650, clientY: 300 }));
    act(() => fireEvent.mouseUp(taskEl, { clientX: 650, clientY: 300 }));
    expect(columnEl.getElementsByClassName(taskStyles.task).length).toBe(2);
  });

  test("handleDragEnd - move task", async ({ expect }) => {
    const setStateFn = vi.fn();
    handleDragEnd(
      {
        source: { droppableId: "column-todo", index: 0 },
        destination: { droppableId: "column-doing", index: 0 },
        draggableId: taskId,
        reason: "DROP" as DropReason,
        type: "DEFAULT",
        mode: "FLUID",
        combine: null,
      },
      JSON.parse(JSON.stringify(defaultBoard)),
      setStateFn
    );
    expect(setStateFn).toBeCalled();
  });

  test("handleDragEnd - move task out of range", async ({ expect }) => {
    const setStateFn = vi.fn();
    handleDragEnd(
      {
        source: { droppableId: "column-todo", index: 0 },
        destination: { droppableId: "columns", index: 5 },
        draggableId: taskId,
        reason: "DROP" as DropReason,
        type: "DEFAULT",
        mode: "FLUID",
        combine: null,
      },
      JSON.parse(JSON.stringify(defaultBoard)),
      setStateFn
    );
    expect(setStateFn).toBeCalled();
  });

  test("handleDragEnd - move column", async ({ expect }) => {
    const setStateFn = vi.fn();
    handleDragEnd(
      {
        source: { droppableId: "columns", index: 0 },
        destination: { droppableId: "columns", index: 1 },
        draggableId: "column-todo",
        reason: "DROP" as DropReason,
        type: "DEFAULT",
        mode: "FLUID",
        combine: null,
      },
      JSON.parse(JSON.stringify(defaultBoard)),
      setStateFn
    );
    expect(setStateFn).toBeCalled();
  });

  test("Edit task", async ({ expect }) => {
    const columnEl = screen.getByTestId("column-0");
    const taskEl = columnEl.getElementsByClassName(taskStyles.task)[0];
    act(() => fireEvent.doubleClick(taskEl));
    const inputEl = taskEl.getElementsByTagName("textarea")[0];
    act(() => fireEvent.input(inputEl, { target: { value: "Task 1" } }));
    act(() => fireEvent.blur(inputEl));
    expect(taskEl.textContent).toContain("Task 1");
  });

  test("Remove task", async ({ expect }) => {
    const columnEl = screen.getByTestId("column-0");
    const taskEl = columnEl.getElementsByClassName(taskStyles.task)[0];
    act(() => fireEvent.click(taskEl.getElementsByClassName(taskStyles.close)[0]));
    expect(columnEl.getElementsByClassName(taskStyles.task).length).toBe(1);
  });

  test("Drawer", ({ expect }) => {
    act(() => render(<Drawer open scope="Global" />));
    act(() => fireEvent.click(screen.getByText("⚙")));
    expect(screen.getByText("Settings")).toBeDefined();
  });
  test("Drawer -> Global", ({ expect }) => {
    act(() => render(<Drawer open scope="Global" />));
    const el = screen.getByText("📋 Open TKB (Workspace)");
    expect(el).toBeDefined();
    act(() => fireEvent.click(el));
  });

  test("Drawer -> Workspace", ({ expect }) => {
    act(() => render(<Drawer open scope="Workspace" />));
    const el = screen.getByText("📋 Open TKB (Global)");
    expect(el).toBeDefined();
    act(() => fireEvent.click(el));
  });
});
