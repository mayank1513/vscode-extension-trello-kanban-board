import { vscode } from "utils/vscode";
import styles from "./drawer.module.scss";

const links = [
  {
    text: "🌟 Rate me on VSCode Marketplace",
    href: "https://marketplace.visualstudio.com/items?itemName=mayank1513.trello-kanban-task-board",
  },
  { text: "🌏 Web Version", href: "https://vscode-extension-trello-kanban-board.vercel.app/" },
  { text: "🌟 Star/Fork me on GitHub", href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board" },
  { text: "📖 Learn", href: "https://mayank-chaudhari.vercel.app/courses" },
  { text: "🤝 Get in touch", href: "https://mayank-chaudhari.vercel.app/" },
];

export default function Drawer({ open }: { open: boolean }) {
  return (
    <aside className={[styles.drawer, open ? styles.open : ""].join(" ")}>
      <ul>
        {links.map(({ text, href }) => (
          <li key={href}>
            <a href={href} target="_blank">
              {text}
            </a>
          </li>
        ))}
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();
              vscode.openSettings();
            }}>
            ⚙ Settings
          </a>
        </li>
      </ul>
    </aside>
  );
}
