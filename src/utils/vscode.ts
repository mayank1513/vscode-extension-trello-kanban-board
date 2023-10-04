import type { WebviewApi } from "vscode-webview";
import type { BoardType, MessageType } from "@/interface";
import { defaultBoard } from "./data";
import { toast as _toast } from "react-toastify";

class VSCodeAPIWrapper {
  private readonly vsCodeApi: WebviewApi<unknown> | undefined;

  constructor() {
    if (typeof acquireVsCodeApi === "function") {
      this.vsCodeApi = acquireVsCodeApi();
    }
  }

  private _postMessage(message: MessageType) {
    if (this.vsCodeApi) {
      this.vsCodeApi.postMessage(message);
    } else {
      console.log(message);
    }
  }

  public toast(text: string, type: "info" | "warn" | "error" | "success" = "info") {
    if (this.vsCodeApi) {
      this._postMessage({ action: type, text });
    } else {
      _toast[type](text);
    }
  }

  /**
   * Get the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, getState will retrieve state
   * from local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @return The current state or `undefined` if no state has been set.
   */
  public async getState(): Promise<BoardType> {
    if (this.vsCodeApi) {
      this._postMessage({ action: "load" });
      return new Promise((res) => {
        const onMessageReceive = ({ data: message }: MessageEvent<MessageType>) => {
          window.removeEventListener("message", onMessageReceive);
          if (message.action === "load") {
            res((message.data?.columns ? message.data : { ...defaultBoard, ...message.data }) as BoardType);
          }
        };
        window.addEventListener("message", onMessageReceive);
      });
    } else {
      const state = localStorage.getItem("vscodeState");
      return state ? JSON.parse(state) : { ...defaultBoard, scope: "Browser" };
    }
  }

  /**
   * Set the persistent state stored for this webview.
   *
   * @remarks When running webview source code inside a web browser, setState will set the given
   * state using local storage (https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
   *
   * @param newState New persisted state. This must be a JSON serializable object. Can be retrieved
   * using {@link getState}.
   *
   * @return The new state.
   */
  public setState(newState: BoardType) {
    if (this.vsCodeApi) {
      this._postMessage({ action: "save", data: newState });
    } else {
      localStorage.setItem("vscodeState", JSON.stringify(newState));
    }
  }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();
