import { Uri, Webview, WorkspaceConfiguration, workspace } from "vscode";
import { prefix } from "../constants";

export function getConfiguration() {
  return workspace.getConfiguration(prefix.slice(0, prefix.length - 1));
}

export function getSaveConfig(config: WorkspaceConfiguration) {
  const rootURI = workspace.workspaceFolders?.[0]?.uri;
  const saveToFile = config.get("Workspace.saveToFile") === "Yes";
  const filePath = config.get("Workspace.filePath") as string;
  return { saveToFile, filePath, rootURI };
}

export function getHTML(webview: Webview, extensionUri: Uri) {
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
