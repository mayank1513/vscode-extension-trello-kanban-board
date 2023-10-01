import { ExtensionContext, commands } from "vscode";
import { Panel } from "./panel";
import { prefix, scopes } from "./constants";

export function activate(context: ExtensionContext) {
  scopes.forEach((scope) => {
    context.subscriptions.push(
      commands.registerCommand(prefix + scope, () => {
        Panel.render(context, scope);
      })
    );
  });
}
