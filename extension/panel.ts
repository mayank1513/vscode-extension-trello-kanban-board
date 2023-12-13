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
} from "vscode";
import { ScopeType, prefix } from "./constants";
import { MessageType } from "./interface";

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
    if (this.Panels[scope]) {
      this.Panels[scope]?._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel("TrelloKanban: " + scope, "TrelloKanban: " + scope, ViewColumn.One, {
        enableScripts: true,
      });
      this.Panels[scope] = new Panel(panel, context, scope);
    }
  }

  public static revive(panel: WebviewPanel, context: ExtensionContext, scope: ScopeType) {
    this.Panels[scope] = new Panel(panel, context, scope);
  }

  private _setupWebView() {
    const { extensionUri, globalState, workspaceState } = this._context;
    const { webview } = this._panel;

    webview.html = this._getHTML(webview, extensionUri);

    this._panel.onDidDispose(this._dispose, null, this._disposables);

    // message listeners
    const scope = this._scope;
    const memento = scope === "Global" ? globalState : workspaceState;
    webview.onDidReceiveMessage(
      (message: MessageType) => this._messageHandler(message, memento, prefix, scope, webview),
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

  private _messageHandler(message: MessageType, memento: Memento, key: string, scope: string, webview: Webview) {
    const { action, data, text } = message;
    switch (action) {
      case "load":
        {
          const data = memento.get(key) || { scope };
          webview.postMessage({ action: "load", data: { ...data, scope } } as MessageType);
        }
        break;
      case "save":
        memento.update(key, data);
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
    }
  }
}
