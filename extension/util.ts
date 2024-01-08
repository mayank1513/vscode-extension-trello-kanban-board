import { workspace } from "vscode";
import { prefix } from "./constants";

export function getConfiguration() {
  return workspace.getConfiguration(prefix.slice(0, prefix.length - 1));
}
