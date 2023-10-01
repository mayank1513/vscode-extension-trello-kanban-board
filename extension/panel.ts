/* eslint-disable @typescript-eslint/no-unused-vars */
import { Disposable, ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from "vscode";
import { createId } from "@paralleldrive/cuid2";
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

  private _setupWebView() {
    const nonce = createId();
    const { extensionUri, globalState, workspaceState } = this._context;
    const { webview } = this._panel;
    const cssUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.css"));
    const jsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.js"));
    const iconUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "logo.png"));

    webview.html = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="icon" type="image/*" href="${iconUri}" nonce="${nonce}"/>
          <link rel="stylesheet" type="text/css" href="${cssUri}">
        </head>
        <body>
          <div id="root">Hare Krishna!</div>
          <script type="module" nonce="${nonce}" src="${jsUri}"></script>
        </body>
      </html>`;

    this._panel.onDidDispose(
      () => {
        this._panel.dispose();
        // Dispose of all disposables (i.e. commands) for the current webview panel
        // using while loop as disposables might be added while disposing other disposables in the array
        while (this._disposables.length) {
          const disposable = this._disposables.pop();
          if (disposable) {
            disposable.dispose();
          }
        }
      },
      null,
      this._disposables
    );

    // message listeners
    const momento = this._scope === "Global" ? globalState : workspaceState;
    const key = prefix;
    webview.onDidReceiveMessage(
      (message: MessageType<unknown>) => {
        const { action, data, text } = message;
        switch (action) {
          case "load":
            webview.postMessage({ action: "load", data: momento.get(key) } as MessageType<unknown>);
            break;
          case "save":
            momento.update(key, data);
            break;
          case "info":
            window.showInformationMessage(text || "");
            break;
          case "warn":
            window.showWarningMessage(text || "");
            break;
          case "error":
            window.showErrorMessage(text || "");
            break;
        }
      },
      undefined,
      this._disposables
    );
  }
}
