import { ExtensionContext, commands, window } from "vscode";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("test", () => {
      window.showInformationMessage("Hare Krishna");
    })
  );
}
