import { createContext, useContext, useEffect, useState } from "react";
import "./App.scss";
import { vscode } from "utils/vscode";
import { BoardType } from "@/interface";
import { defaultBoard } from "utils/data";
import Board from "components/board";

interface ContextType {
  state: BoardType;
  setState: (state: BoardType) => void;
}

const GlobalContext = createContext<ContextType>({} as ContextType);

export const useGlobalState = () => useContext(GlobalContext);
function App() {
  const [state, _setState] = useState<BoardType>(defaultBoard);
  const setState = (state: BoardType) => {
    _setState(state);
    vscode.setState(state);
  };

  useEffect(() => {
    vscode.getState().then((state) => _setState(state || defaultBoard));
  }, []);

  return (
    <GlobalContext.Provider value={{ state, setState }}>
      <Board />
    </GlobalContext.Provider>
  );
}

export default App;
