/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import pkg from "./package.json";

/** Following constants should match /extension/constants.ts */
const scopes = ["Workspace", "Global"];
export const prefix = "mayank1513.trello-kanban.";

const packageJSON = {
  name: "trello-kanban-task-board",
  displayName: "Trello like kanban board",
  description: "Simple trello like kanban board for VS Code. Visually organize your ideas!",
  version: pkg.version,
  publisher: "mayank1513",
  icon: "logo.png",
  engines: {
    vscode: "^1.75.0",
  },
  repository: {
    type: "git",
    url: "https://github.com/mayank1513/vscode-extension-trello-kanban-board",
  },
  bugs: {
    url: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/issues",
  },
  main: "./index.js",
  contributes: {
    commands: scopes.map((scope) => ({
      command: prefix + scope,
      title: "TrelloKanban: " + scope,
    })),
  },
  activationEvents: scopes.map((scope) => `onWebviewPanel:${prefix}${scope}`),
  sponsor: {
    url: "https://github.com/sponsors/mayank1513",
  },
  license: "MIT",
};

fs.writeFileSync(path.resolve(process.cwd(), "dist", "package.json"), JSON.stringify(packageJSON, null, 2));

const readMe = fs.readFileSync(path.resolve(process.cwd(), "README.md"), "utf-8");

fs.writeFileSync(path.resolve(process.cwd(), "dist", "README.md"), readMe.replace(/.*\.svg.*/g, "")); // remove lines with .svg
fs.copyFileSync(path.resolve(process.cwd(), "LICENSE"), path.resolve(process.cwd(), "dist", "LICENSE"));

fs.unlinkSync(path.resolve(process.cwd(), "dist", "index.html"));
