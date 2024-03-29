import { ExtensionContext, StatusBarAlignment, StatusBarItem, commands, window, workspace } from "vscode";
import { Panel } from "./panel";
import { ScopeType, prefix, scopes } from "./constants";
import { getConfiguration } from "./utils/config";

const viewButtons: Record<ScopeType, StatusBarItem | null> = {
  Global: null,
  Workspace: null,
};

export function activate(context: ExtensionContext) {
  scopes.forEach((scope) => registerCommandAndPanelSerializer(context, scope));
  scopes.forEach((scope) => createStatusBarButton(context, scope));
  listenConfigChange(context);
}

function registerCommandAndPanelSerializer(context: ExtensionContext, scope: ScopeType) {
  const command = prefix + scope;
  context.subscriptions.push(commands.registerCommand(command, () => Panel.render(context, scope)));
  window.registerWebviewPanelSerializer(command, {
    async deserializeWebviewPanel(webviewPanel) {
      try {
        Panel.revive(webviewPanel, context, scope);
      } catch (e) {
        Panel.render(context, scope);
      }
    },
  });
}

function listenConfigChange(context: ExtensionContext) {
  workspace.onDidChangeConfiguration((e) => {
    scopes.forEach((scope) => {
      if (e.affectsConfiguration(prefix + scope + ".statusBar")) createStatusBarButton(context, scope);
    });
  });
}

function createStatusBarButton(context: ExtensionContext, scope: ScopeType) {
  const config = getConfiguration();
  const alignment = config.get(scope + ".statusBar.alignment");
  const priority = config.get(scope + ".statusBar.priority") as number;
  if (viewButtons[scope]) {
    viewButtons[scope]?.hide();
    viewButtons[scope] = null;
  }
  if (alignment !== "None") {
    const buttonAlignment = alignment === "Left" ? StatusBarAlignment.Left : StatusBarAlignment.Right;

    const viewButton = window.createStatusBarItem(buttonAlignment, priority);

    viewButton.command = prefix + scope;
    viewButton.text = `$(project) TKB (${scope})`;

    viewButtons[scope] = viewButton;
    if (viewButton) {
      context.subscriptions.push(viewButton);
      viewButton.show();
    }
  }
}

export function deactivate() {}
