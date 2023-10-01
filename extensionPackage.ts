import fs from "fs";
import path from "path";

const packageJSON = {
  name: "trello-kanban-task-board",
  displayName: "Trello like kanban board",
  description: "Simple trello like kanban board for VS Code. Visually organize your ideas!",
  version: "0.0.1",
  publisher: "mayank1513",
  icon: "",
  engines: {
    vscode: "^1.75.0",
  },
  main: "./index.js",
  contributes: {
    commands: [{ command: "test", title: "Kanban: Test" }],
  },
  sponsor: {
    url: "https://github.com/sponsors/mayank1513",
  },
};

fs.writeFileSync(path.resolve(process.cwd(), "dist", "package.json"), JSON.stringify(packageJSON, null, 2));
