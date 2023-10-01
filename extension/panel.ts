/* eslint-disable @typescript-eslint/no-unused-vars */
import { Disposable, ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from "vscode";
import { createId } from "@paralleldrive/cuid2";

export class Panel {
  private _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _context: ExtensionContext;
  private constructor(panel: WebviewPanel, context: ExtensionContext) {
    this._panel = panel;
    this._context = context;
    this._setupWebView();
  }
  public static render(context: ExtensionContext) {
    const panel = window.createWebviewPanel("TrelloKanban", "TrelloKanban", ViewColumn.One, {
      enableScripts: true,
    });
    new Panel(panel, context);
  }

  private _setupWebView() {
    const nonce = createId();
    const { extensionUri } = this._context;
    const { webview } = this._panel;
    const cssUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.css"));
    const jsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "assets", "index.js"));

    webview.html = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
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
  }
}
