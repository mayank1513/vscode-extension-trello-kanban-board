/* eslint-disable no-undef */
import fs from "fs";
import path from "path";
import { Octokit } from "octokit";

/** Following constants should match /extension/constants.ts */
const scopes = ["Workspace", "Global"];
export const prefix = "mayank1513.trello-kanban.";

const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));

if (process.env.TOKEN) {
  // Octokit.js
  // https://github.com/octokit/core.js#readme
  const octokit = new Octokit({
    auth: process.env.TOKEN,
  });

  const octoOptions = {
    owner: process.env.OWNER,
    repo: process.env.REPO,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };
  const tagName = `v${pkg.version}`;
  const name = `Release ${tagName}`;
  /** Create a release */
  octokit.request("POST /repos/{owner}/{repo}/releases", {
    ...octoOptions,
    tag_name: tagName,
    target_commitish: "main",
    name,
    draft: false,
    prerelease: false,
    generate_release_notes: true,
  });
}

const configs = {
  [prefix + "Workspace.saveToFile"]: {
    type: "string",
    default: "Yes",
    enum: ["Yes", "No"],
    description: "Save workspace data to a file.",
  },
  [prefix + "Workspace.filePath"]: {
    type: "string",
    /** set to --ignored-- when user chooses "don't ask again" */
    default: "",
    description:
      "The path of the file (relative to current workspace) to save the data to. Prefer saving this to workspace config.",
  },
};

scopes.forEach((scope) => {
  configs[prefix + scope + ".statusBar.alignment"] = {
    type: "string",
    default: "Left",
    enum: ["Left", "Right", "None"],
    description: "Show the Kanban button on the left or right side of your status bar, or nowhere.",
  };
  configs[prefix + scope + ".statusBar.priority"] = {
    type: "number",
    default: 100,
    description: "Where the Kanban button should be in relation to other buttons. A higher value means further left.",
  };
});

const packageJSON = {
  name: pkg.name,
  displayName: "Trello Kanban Board",
  description: "Simple trello like kanban board for Visual Studio Code. Visually organize your ideas!",
  version: pkg.version,
  publisher: "mayank1513",
  icon: "logo.png",
  engines: {
    vscode: "^1.75.0",
  },
  license: "MIT",
  author: {
    name: "Mayank Kumar Chaudhari",
    url: "https://mayank-chaudhari.vercel.app/",
  },
  categories: ["Visualization", "Notebooks", "Other"],
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
    configuration: {
      title: "Trello Kanban Board",
      properties: configs,
    },
  },
  activationEvents: ["onStartupFinished"],
  sponsor: {
    url: "https://github.com/sponsors/mayank1513",
  },
  keywords: pkg.keywords,
  badges: [
    {
      description: "Test",
      url: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/actions/workflows/test.yml/badge.svg",
      href: "https://github.com/mayank1513/vscode-extension-trello-kanban-board/actions/workflows/test.yml",
    },
    {
      description: "Coverage",
      url: "https://codecov.io/gh/mayank1513/vscode-extension-trello-kanban-board/graph/badge.svg",
      href: "https://codecov.io/gh/mayank1513/vscode-extension-trello-kanban-board",
    },
    {
      description: "Maintainability",
      url: "https://api.codeclimate.com/v1/badges/ac44e4371dd3a274285e/maintainability",
      href: "https://codeclimate.com/github/mayank1513/vscode-extension-trello-kanban-board/maintainability",
    },
    {
      description: "PayPal Donate",
      url: "https://img.shields.io/badge/paypal-donate-blue.svg",
      href: "https://paypal.me/mayank1513",
    },
  ],
};

fs.writeFileSync(path.resolve(process.cwd(), "dist", "package.json"), JSON.stringify(packageJSON, null, 2));

const readMe = fs.readFileSync(path.resolve(process.cwd(), "README.md"), "utf-8");

fs.writeFileSync(path.resolve(process.cwd(), "dist", "README.md"), readMe.replace(/.*\.svg.*/g, "")); // remove lines with .svg
fs.copyFileSync(path.resolve(process.cwd(), "LICENSE"), path.resolve(process.cwd(), "dist", "LICENSE"));
fs.copyFileSync(path.resolve(process.cwd(), "CHANGELOG.md"), path.resolve(process.cwd(), "dist", "CHANGELOG.md"));
try {
  fs.unlinkSync(path.resolve(process.cwd(), "dist", "index.html"));
} catch {
  // ignore - index.html may not exist when we are building only extension multiple times without building the frontend
}
