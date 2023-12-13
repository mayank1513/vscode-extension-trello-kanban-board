import { ExtensionContext, StatusBarAlignment, StatusBarItem, commands, window, workspace } from "vscode";
import { Panel } from "./panel";
import { ScopeType, prefix, scopes } from "./constants";

const viewButtons: Record<ScopeType, StatusBarItem | null> = {
  Global: null,
  Workspace: null,
};

export function activate(context: ExtensionContext) {
  scopes.forEach((scope) => {
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

    createStatusBarButton(context, scope);
  });
  listenConfigChange(context);
}

function listenConfigChange(context: ExtensionContext) {
  workspace.onDidChangeConfiguration((e) => {
    scopes.forEach((scope) => {
      if (e.affectsConfiguration(prefix + scope + ".statusBar")) createStatusBarButton(context, scope);
    });
  });
}

function createStatusBarButton(context: ExtensionContext, scope: ScopeType) {
  const config = workspace.getConfiguration(prefix.slice(0, prefix.length - 1));

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
