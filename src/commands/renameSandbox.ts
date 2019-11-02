import * as vscode from 'vscode';
import Client from '../client';
import open from '../open';

export default async function renameSandbox(context: vscode.ExtensionContext, client: Client) {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) {
    return;
  }

  const name = await vscode.window.showInputBox({
    placeHolder: 'Input new name',
  });

  if (!name) {
    return;
  }

  const sandbox = await client.updateSandbox(folders[0].uri.authority, { name });
  open(sandbox);
}
