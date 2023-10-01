import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- ts-node expects .ts extension
import { prefix, scopes } from "./extension/constants.ts";

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
    commands: scopes.map((scope) => ({
      command: prefix + scope,
      title: "TrelloKanban: " + scope,
    })),
  },
  sponsor: {
    url: "https://github.com/sponsors/mayank1513",
  },
};

fs.writeFileSync(path.resolve(process.cwd(), "dist", "package.json"), JSON.stringify(packageJSON, null, 2));
