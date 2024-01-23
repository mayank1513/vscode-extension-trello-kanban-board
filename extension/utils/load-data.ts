import { Memento, Uri, WorkspaceConfiguration, window, workspace } from "vscode";
import { BoardType, ColumnType, IGNORED, ScopeType, TaskType, prefix } from "../interface";
import { resolveTKBFile } from "./save";
import { getConfiguration, getSaveConfig } from "./config";

// validating data
function parseTasks(data: BoardType, parsedData: BoardType) {
  if (typeof data.tasks === "object" && !Array.isArray(data.tasks)) {
    parsedData.tasks = {} as Record<string, TaskType>;
    Object.keys(data.tasks).forEach((key) => {
      if (data.tasks[key].id !== key) throw new Error();
      if (typeof data.tasks[key].description !== "string") throw new Error();
      if (typeof data.tasks[key].columnId !== "string") throw new Error();
      parsedData.tasks[key] = {
        id: data.tasks[key].id,
        description: data.tasks[key].description,
        columnId: data.tasks[key].columnId,
      };
    });
  } else {
    throw new Error();
  }
}

function parseColumns(data: BoardType, parsedData: BoardType) {
  if (Array.isArray(data.columns)) {
    parsedData.columns = [];
    data.columns.forEach((col: ColumnType) => {
      const parsedCol: ColumnType = {} as ColumnType;
      if (typeof col.id !== "string") throw new Error();
      if (typeof col.title !== "string") throw new Error();
      parsedCol.id = col.id;
      parsedCol.title = col.title;
      if (Array.isArray(col.tasksIds)) {
        parsedCol.tasksIds = [];
        col.tasksIds.forEach((tId: string) => {
          if (typeof tId !== "string") throw new Error();
          if (!parsedData.tasks[tId]) throw new Error();
          parsedCol.tasksIds.push(tId);
        });
      } else {
        throw new Error();
      }
      parsedData.columns.push(parsedCol);
    });
  } else {
    throw new Error();
  }
}

async function parseFileData(fileData: string, pathUri: Uri) {
  try {
    const data = JSON.parse(fileData);
    const parsedData: BoardType = {} as BoardType;
    parsedData.theme = data.theme;
    parsedData.scope = data.scope;
    parseTasks(data, parsedData);
    parseColumns(data, parsedData);
    return parsedData;
  } catch {
    try {
      await workspace.fs.rename(pathUri, Uri.file(pathUri.path + ".invalid"));
    } catch {
      await workspace.fs.rename(pathUri, Uri.file(pathUri.path + ".invalid" + Math.random().toFixed(3)));
    }
    throw new Error("Invalid TKB file!");
  }
}

async function attemptLoadFromAnotherFile(
  config: WorkspaceConfiguration,
  rootURI: Uri,
  tkbFile: string,
  fileNotFound: boolean
) {
  const anotherTkbFile = await resolveTKBFile(rootURI, IGNORED);
  if (!anotherTkbFile) {
    window.showErrorMessage("Failed to load TKB file. New file will be created automatically!");
    return;
  }

  const ans = await window.showErrorMessage(
    `\`${tkbFile}\` file ${
      fileNotFound ? "not found" : "is invalid"
    }. Found another TKB file at \`${anotherTkbFile}\`. Do you want to use this instead?`,
    "Yes",
    "No"
  );
  if (ans === "Yes") {
    return await loadFromFile(config, rootURI, anotherTkbFile);
  } else {
    window.showInformationMessage("Falling back to workspace data. New file will be created automatically!");
  }
}

async function loadFromFile(config: WorkspaceConfiguration, rootURI: Uri, tkbFile: string): Promise<BoardType> {
  let data;
  let fileNotFound = true;
  try {
    const pathUri = Uri.joinPath(rootURI, tkbFile);
    const fileData = (await workspace.fs.readFile(pathUri)).toString();
    fileNotFound = false;
    data = await parseFileData(fileData, pathUri);
    // update filePath once the data is loaded successfully
    config.update("Workspace.filePath", tkbFile);
  } catch {
    data = await attemptLoadFromAnotherFile(config, rootURI, tkbFile, fileNotFound);
  }
  return data as BoardType;
}

async function loadWithPrompt(config: WorkspaceConfiguration, rootURI: Uri, tkbFile: string) {
  const ans = await window.showInformationMessage(
    `Found \`${tkbFile}\` file. Do you want to sync Trello Kanban Board to this file?`,
    "Yes",
    "No",
    "Don't ask again"
  );
  let data;
  switch (ans) {
    case "Don't ask again":
      config.update("Workspace.filePath", IGNORED);
      break;
    case "Yes":
      config.update("Workspace.filePath", tkbFile);
      config.update("Workspace.saveToFile", "Yes");
      try {
        data = await loadFromFile(config, rootURI, tkbFile);
      } catch {
        window.showErrorMessage("Failed to load TKB file. Falling back to workspace data.");
      }
      break;
    case "No":
  }
  return data;
}

export async function loadData(memento: Memento, scope: ScopeType) {
  let data = memento.get(prefix) || {};
  if (scope === "Global") {
    return { ...data, scope };
  }
  const config = getConfiguration();
  const { saveToFile, filePath, rootURI } = getSaveConfig(config);
  if (rootURI) {
    const tkbFile = await resolveTKBFile(rootURI, filePath);
    if (saveToFile && tkbFile) {
      if (tkbFile !== filePath) config.update("Workspace.filePath", tkbFile);
      data = await loadFromFile(config, rootURI, tkbFile);
    } else if (tkbFile && filePath !== IGNORED) {
      data = (await loadWithPrompt(config, rootURI, tkbFile)) ?? data;
    }
  }
  return { ...data, scope };
}
