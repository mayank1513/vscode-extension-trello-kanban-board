import {
  Disposable,
  ExtensionContext,
  Memento,
  Uri,
  ViewColumn,
  Webview,
  WebviewPanel,
  commands,
  window,
  workspace,
} from "vscode";
import { ScopeType, prefix } from "./constants";
import { MessageType } from "./interface";
import { getConfiguration, getHTML, getSaveConfig } from "./utils/config";
import { resolveTKBFile } from "./utils/save";
import { loadData } from "./utils/load-data";

export class Panel {
  public static Panels: Record<ScopeType, Panel | undefined> = { Global: undefined, Workspace: undefined };
  private _panel: WebviewPanel;
  private _scope: ScopeType;
  private _context: ExtensionContext;
  private _disposables: Disposable[] = [];
  private constructor(panel: WebviewPanel, context: ExtensionContext, scope: ScopeType) {
    this._panel = panel;
    this._scope = scope;
    this._context = context;
    this._setupWebView();
  }

  public static render(context: ExtensionContext, scope: ScopeType) {
    if (Panel.Panels[scope]) {
      Panel.Panels[scope]?._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel("TrelloKanban" + scope, "TrelloKanban: " + scope, ViewColumn.One, {
        enableScripts: true,
      });
      Panel.Panels[scope] = new Panel(panel, context, scope);
    }
  }

  public static revive(panel: WebviewPanel, context: ExtensionContext, scope: ScopeType) {
    Panel.Panels[scope] = new Panel(panel, context, scope);
  }

  private _setupWebView() {
    const { extensionUri, globalState, workspaceState } = this._context;
    const { webview } = this._panel;

    webview.html = getHTML(webview, extensionUri);

    this._panel.onDidDispose(this._dispose, this, this._disposables);

    // message listeners
    const memento = this._scope === "Global" ? globalState : workspaceState;
    webview.onDidReceiveMessage(
      (message: MessageType) => this._messageHandler(message, memento, webview),
      this,
      this._disposables
    );
  }

  private _dispose() {
    if (this._scope === "Workspace") this._saveToFile();
    Panel.Panels[this._scope] = undefined;
    this._panel.dispose();
    // Dispose of all disposables (i.e. commands) for the current webview panel
    // using while loop as disposables might be added while disposing other disposables in the array
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private async _messageHandler(message: MessageType, memento: Memento, webview: Webview) {
    const { action, data, text } = message;
    switch (action) {
      case "load":
        webview.postMessage({ action: "load", data: await loadData(memento, this._scope) } as MessageType);
        break;
      case "save":
        memento.update(prefix, data);
        this._saveToFile();
        break;
      case "success":
      case "info":
        window.showInformationMessage(text || "");
        break;
      case "warn":
        window.showWarningMessage(text || "");
        break;
      case "error":
        window.showErrorMessage(text || "");
        break;
      case "settings":
        commands.executeCommand("workbench.action.openSettings", "mayank1513.trello-kanban-task-board");
        break;
      case "showPanel":
        commands.executeCommand(prefix + (this._scope === "Global" ? "Workspace" : "Global"));
        break;
    }
  }

  private async _saveToFile() {
    const config = getConfiguration();
    const { saveToFile, filePath, rootURI } = getSaveConfig(config);
    if (!rootURI || !saveToFile) return;
    const tkbFile = (await resolveTKBFile(rootURI, filePath)) ?? ".tkb";
    if (tkbFile !== filePath) config.update("Workspace.filePath", tkbFile);
    workspace.fs.writeFile(
      Uri.joinPath(rootURI, tkbFile),
      new TextEncoder().encode(JSON.stringify(this._context.workspaceState.get(prefix)))
    );
  }
}
