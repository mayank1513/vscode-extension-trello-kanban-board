import { ExtensionContext, commands, window } from "vscode";
import { Panel } from "./panel";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("test", () => {
      window.showInformationMessage("Hare Krishna");
      Panel.render(context);
    })
  );
}
