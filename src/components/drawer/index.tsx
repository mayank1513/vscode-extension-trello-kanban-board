import { vscode } from "utils/vscode";
import styles from "./drawer.module.scss";
import { MouseEventHandler } from "react";
import { useGlobalState } from "utils/context";

const links = [
  {
    text: "🌟 Rate me on Marketplace",
    href: "https://marketplace.visualstudio.com/items?itemName=mayank1513.trello-kanban-task-board&ssr=false#review-details",
  },
  { text: "🌏 Web Version", href: "https://vscode-extension-trello-kanban-board.vercel.app/" },
  {
    text: "🤝 Request new features",
    href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/issues/new?assignees=&labels=&projects=&template=feature_request.md&title=",
  },
  {
    text: "💬 Ask question/discuss ideas",
    href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/discussions/categories/q-a",
  },
  {
    text: "📝 Report a bug",
    href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=",
  },
  { text: "🌟 Star/Fork me on GitHub", href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board" },
  { text: "📖 Learn", href: "https://mayank-chaudhari.vercel.app/courses" },
  { text: "🤝 Get in touch", href: "https://mayank-chaudhari.vercel.app/" },
];

export default function Drawer({ open, scope }: { open: boolean; scope: string }) {
  const { state, setState } = useGlobalState();

  return (
    <aside className={[styles.drawer, open ? styles.open : ""].join(" ")}>
      <ul>
        {scope !== "Browser" && <ExtensionOnlyUI scope={scope} />}
        <li>
          <label htmlFor="trails">
            <input
              id="trails"
              type="checkbox"
              checked={!state?.hideTrails}
              onChange={() => setState({ ...state, hideTrails: (state.hideTrails ?? 0 + 1) % 2 })}
            />
            {"  "}
            Show mouse trails?
          </label>
        </li>
        {links.map(({ text, href }) => (
          <li key={href}>
            <a href={href} target="_blank">
              {text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Keeping this funciton outside is Equivalent to useCallback */
const openSettings: MouseEventHandler<HTMLAnchorElement> = (e) => {
  e.preventDefault();
  vscode.openSettings();
};

const showGlobalPanel: MouseEventHandler<HTMLAnchorElement> = (e) => {
  e.preventDefault();
  vscode.showPanel("Global");
};

const showWorkspacePanel: MouseEventHandler<HTMLAnchorElement> = (e) => {
  e.preventDefault();
  vscode.showPanel("Workspace");
};

function ExtensionOnlyUI({ scope }: { scope: string }) {
  return (
    <>
      <li>
        <a onClick={openSettings}>
          <b>⚙</b> Settings
        </a>
      </li>
      {scope === "Global" ? (
        <li>
          <a onClick={showWorkspacePanel}>📋 Open TKB (Workspace)</a>
        </li>
      ) : (
        <li>
          <a onClick={showGlobalPanel}>📋 Open TKB (Global)</a>
        </li>
      )}
    </>
  );
}
