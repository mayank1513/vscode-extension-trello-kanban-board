import { Uri, workspace } from "vscode";
import { IGNORED } from "../constants";

export async function resolveTKBFile(rootURI: Uri, filePath: string) {
  let tkbFile = filePath || undefined;
  if (tkbFile === IGNORED) tkbFile = undefined;
  if (tkbFile !== undefined) return tkbFile;

  const rootFiles = await workspace.fs.readDirectory(Uri.file(rootURI.path));
  tkbFile = rootFiles.find((file) => file[0].match(".tkb$") && file[1] === 1)?.[0];
  if (tkbFile !== undefined) return tkbFile;

  const vscodeDir = rootFiles.find((file) => file[0] === ".vscode" && file[1] === 2);
  if (vscodeDir) {
    const vsCodeFiles = await workspace.fs.readDirectory(Uri.joinPath(rootURI, vscodeDir[0]));
    tkbFile = vsCodeFiles.find((file) => file[0].match(".tkb$") && file[1] === 1)?.[0];
  }
  tkbFile = tkbFile !== undefined ? `.vscode/${tkbFile}` : undefined;
  return tkbFile;
}
