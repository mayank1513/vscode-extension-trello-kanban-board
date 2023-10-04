import { ExtensionContext, commands, window } from "vscode";
import { Panel } from "./panel";
import { prefix, scopes } from "./constants";

export function activate(context: ExtensionContext) {
  scopes.forEach((scope) => {
    context.subscriptions.push(
      commands.registerCommand(prefix + scope, () => {
        Panel.render(context, scope);
      })
    );
    window.registerWebviewPanelSerializer(prefix + scope, {
      async deserializeWebviewPanel(webviewPanel) {
        Panel.revive(webviewPanel, context, scope);
      },
    });
  });
}
