import { useEffect, useState } from "react";
import { vscode } from "utils/vscode";
import { BoardType } from "@/interface";
import { defaultBoard } from "utils/data";
import Board from "components/board";
import { GlobalContext } from "utils/context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeSwitcher } from "nextjs-themes";
import { MouseTrail } from "react-webgl-trails";
import { Particles } from "webgl-generative-particles/react";

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
      <ThemeSwitcher storage="localStorage" themeTransition="all .3s" />
      <Board />
      <ToastContainer position="bottom-right" />
      {!state.hideTrails && (
        <>
          <MouseTrail />
          <Particles fullScreenOverlay />
        </>
      )}
    </GlobalContext.Provider>
  );
}

export default App;
