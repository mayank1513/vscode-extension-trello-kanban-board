import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "App";
import { afterEach, beforeEach, describe, test } from "vitest";
import boardStyles from "./components/board.module.scss";
import taskStyles from "./components/task/task.module.scss";

describe("Test Board", () => {
  afterEach(cleanup);
  beforeEach(async () => {
    await act(async () => render(<App />));
  });
  test("Board Header", ({ expect }) => {
    const header = screen.getByTestId("board-header");
    console.log(header.textContent);
    expect(header.textContent).toContain("Trello Kanban Board");
    expect(header.className).toBe(boardStyles.header);
  });
  test("Install VSCode Extension button", async ({ expect }) => {
    expect(screen.queryByText("Install VSCode Extension")).toBeInTheDocument();
  });

  test("Create a new column", ({ expect }) => {
    act(() => fireEvent.click(screen.getByText("Add Column")));
    /** for some reason renderHook is always returning null state */
    expect(screen.queryByTestId("column-3")).toBeInTheDocument();
  });

  test("Create a new task", ({ expect }) => {
    const columnEl = screen.getByTestId("column-3");
    act(() => fireEvent.click(columnEl.getElementsByTagName("button")[0]));
    expect(columnEl.getElementsByClassName(taskStyles.task).length).toBe(1);
  });
});
