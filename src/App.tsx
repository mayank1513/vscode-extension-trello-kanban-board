import { useEffect, useState } from "react";
import "./App.css";
import { vscode } from "utils/vscode";

function App() {
  const [count, _setCount] = useState(0);
  const setCount = (count: number) => {
    _setCount(count);
    vscode.setState(count);
  };

  useEffect(() => {
    vscode.getState().then((count) => {
      _setCount((count || 0) as number);
    });
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount(count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
