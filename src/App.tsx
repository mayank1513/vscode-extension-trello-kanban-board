import { useEffect, useState } from "react";
import { vscode } from "utils/vscode";
import { BoardType } from "@/interface";
import { defaultBoard } from "utils/data";
import Board from "components/board";
import { GlobalContext } from "utils/context";

function App() {
  const [state, _setState] = useState<BoardType>(defaultBoard);
  const setState = (state: BoardType) => {
    _setState(state);
    vscode.setState(state);
  };

  useEffect(() => {
    vscode.getState().then((state) => _setState(state));
  }, []);

  return (
    <GlobalContext.Provider value={{ state, setState }}>
      <Board />
    </GlobalContext.Provider>
  );
}

export default App;
