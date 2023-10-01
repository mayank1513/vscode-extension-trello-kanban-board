/* eslint-disable @typescript-eslint/no-unused-vars */
import { Disposable, ExtensionContext, Uri, ViewColumn, WebviewPanel, window } from "vscode";

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
    const { webview } = this._panel;

    webview.html = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <div id="root">Hare Krishna!</div>
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
