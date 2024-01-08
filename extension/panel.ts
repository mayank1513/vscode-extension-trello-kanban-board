import {
  Disposable,
  ExtensionContext,
  Memento,
  Uri,
  ViewColumn,
  Webview,
  WebviewPanel,
  WorkspaceConfiguration,
  commands,
  window,
  workspace,
} from "vscode";
import { IGNORED, ScopeType, prefix } from "./constants";
import { BoardType, ColumnType, MessageType, TaskType } from "./interface";
import { getConfiguration } from "./util";

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
      const panel = window.createWebviewPanel("TrelloKanban: " + scope, "TrelloKanban: " + scope, ViewColumn.One, {
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

    webview.html = this._getHTML(webview, extensionUri);

    this._panel.onDidDispose(this._dispose, this, this._disposables);

    // message listeners
    const memento = this._scope === "Global" ? globalState : workspaceState;
    webview.onDidReceiveMessage(
      (message: MessageType) => this._messageHandler(message, memento, webview),
      undefined,
      this._disposables
    );
  }

  private _getHTML(webview: Webview, extensionUri: Uri) {
    const cssUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.css"));
    const jsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.js"));
    const iconUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "logo.png"));
    return `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource}; img-src ${webview.cspSource} data: https:;">
          <link rel="icon" type="image/*" href="${iconUri}" />
          <link rel="stylesheet" type="text/css" href="${cssUri}">
        </head>
        <body>
          <div id="root">Hare Krishna!</div>
          <script type="module" src="${jsUri}"></script>
        </body>
      </html>`;
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

  private _getSaveConfig(config: WorkspaceConfiguration) {
    const rootURI = workspace.workspaceFolders?.[0]?.uri;
    const saveToFile = config.get("Workspace.saveToFile") as boolean;
    const filePath = config.get("Workspace.filePath") as string;
    return { saveToFile, filePath, rootURI };
  }

  // validating data
  private async _parseFileData(fileData: string, pathUri: Uri) {
    try {
      const data = JSON.parse(fileData);
      const parsedData: BoardType = {} as BoardType;
      parsedData.theme = data.theme;
      parsedData.scope = data.scope;
      if (Array.isArray(data.columns)) {
        parsedData.columns = [];
        data.columns.forEach((col: ColumnType) => {
          const parsedCol: ColumnType = {} as ColumnType;
          if (typeof col.id !== "string") throw new Error();
          if (typeof col.title !== "string") throw new Error();
          parsedCol.id = col.id;
          parsedCol.title = col.title;
          if (Array.isArray(col.tasksIds)) {
            parsedCol.tasksIds = [];
            col.tasksIds.forEach((tId: string) => {
              if (typeof tId !== "string") throw new Error();
              parsedCol.tasksIds.push(tId);
            });
          } else {
            throw new Error();
          }
          parsedData.columns.push(parsedCol);
        });
      } else {
        throw new Error();
      }
      if (typeof data.tasks === "object" && !Array.isArray(data.task)) {
        parsedData.tasks = {} as Record<string, TaskType>;
        Object.keys(data.tasks).forEach((key) => {
          if (data.tasks[key].id !== key) throw new Error();
          if (typeof data.tasks[key].description !== "string") throw new Error();
          if (typeof data.tasks[key].columnId !== "string") throw new Error();
          parsedData.tasks[key] = {
            id: data.tasks[key].id,
            description: data.tasks[key].description,
            columnId: data.tasks[key].columnId,
          };
        });
      } else {
        throw new Error();
      }
      return parsedData;
    } catch {
      try {
        await workspace.fs.rename(pathUri, Uri.file(pathUri.path + ".invalid"));
      } catch {
        await workspace.fs.rename(pathUri, Uri.file(pathUri.path + ".invalid" + Math.random().toFixed(3)));
      }
      throw new Error("Invalid TKB file!");
    }
  }

  private async _loadFromFile(config: WorkspaceConfiguration, rootURI: Uri, tkbFile: string): Promise<BoardType> {
    let data;
    let fileNotFound = true;
    try {
      const pathUri = Uri.joinPath(rootURI, tkbFile);
      const fileData = (await workspace.fs.readFile(pathUri)).toString();
      fileNotFound = false;
      data = await this._parseFileData(fileData, pathUri);
      // update filePath once the data is loaded successfully
      config.update("Workspace.filePath", tkbFile);
    } catch {
      const anotherTkbFile = await this._resolveTKBFile(rootURI, IGNORED);
      if (anotherTkbFile) {
        const ans = await window.showErrorMessage(
          `\`${tkbFile}\` file ${
            fileNotFound ? "not found" : "is invalid"
          }. Found another TKB file at \`${anotherTkbFile}\`. Do you want to use this instead?`,
          "Yes",
          "No"
        );
        if (ans === "Yes") {
          data = await this._loadFromFile(config, rootURI, anotherTkbFile);
        } else {
          window.showInformationMessage("Falling back to workspace data. New file will be created automatically!");
        }
      } else {
        window.showErrorMessage("Failed to load TKB file. New file will be created automatically!");
      }
    }
    return data as BoardType;
  }

  private async _loadData(memento: Memento) {
    const scope = this._scope;
    let data = memento.get(prefix) || {};
    if (scope === "Global") {
      return { ...data, scope };
    }
    const config = getConfiguration();
    const { saveToFile, filePath, rootURI } = this._getSaveConfig(config);
    if (rootURI) {
      const tkbFile = await this._resolveTKBFile(rootURI, filePath);
      if (saveToFile && tkbFile) {
        if (tkbFile !== filePath) config.update("Workspace.filePath", tkbFile);
        data = await this._loadFromFile(config, rootURI, tkbFile);
      } else if (tkbFile && filePath !== IGNORED) {
        const ans = await window.showInformationMessage(
          `Found \`${tkbFile}\` file. Do you want to sync Trello Kanban Board to this file?`,
          "Yes",
          "No",
          "Don't ask again"
        );
        switch (ans) {
          case "Don't ask again":
            config.update("Workspace.filePath", IGNORED);
            break;
          case "Yes":
            config.update("Workspace.filePath", tkbFile);
            config.update("Workspace.saveToFile", true);
            try {
              data = JSON.parse((await workspace.fs.readFile(Uri.joinPath(rootURI, tkbFile))).toString());
            } catch {
              window.showErrorMessage("Failed to load TKB file. Falling back to workspace data.");
            }
            break;
          case "No":
        }
      }
    }
    return { ...data, scope };
  }

  private async _messageHandler(message: MessageType, memento: Memento, webview: Webview) {
    const { action, data, text } = message;
    switch (action) {
      case "load":
        webview.postMessage({ action: "load", data: await this._loadData(memento) } as MessageType);
        break;
      case "save":
        memento.update(prefix, data);
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

  private async _resolveTKBFile(rootURI: Uri, filePath: string) {
    let tkbFile = filePath || undefined;
    if (tkbFile === IGNORED) tkbFile = undefined;
    if (tkbFile === undefined) {
      const rootFiles = await workspace.fs.readDirectory(Uri.file(rootURI.path));
      tkbFile = rootFiles.find((file) => file[0].match(".tkb$") && file[1] === 1)?.[0];
      if (tkbFile === undefined) {
        const vscodeDir = rootFiles.find((file) => file[0] === ".vscode" && file[1] === 2);
        if (vscodeDir) {
          const vsCodeFiles = await workspace.fs.readDirectory(Uri.joinPath(rootURI, vscodeDir[0]));
          tkbFile = vsCodeFiles.find((file) => file[0].match(".tkb$") && file[1] === 1)?.[0];
        }
        tkbFile = tkbFile !== undefined ? `.vscode/${tkbFile}` : undefined;
      }
    }
    return tkbFile;
  }

  private async _saveToFile() {
    const config = getConfiguration();
    const { saveToFile, filePath, rootURI } = this._getSaveConfig(config);
    if (!rootURI || !saveToFile) return;
    const tkbFile = (await this._resolveTKBFile(rootURI, filePath)) ?? ".tkb";
    if (tkbFile !== filePath) config.update("Workspace.filePath", tkbFile);
    workspace.fs.writeFile(
      Uri.joinPath(rootURI, tkbFile),
      new TextEncoder().encode(JSON.stringify(this._context.workspaceState.get(prefix)))
    );
  }
}
