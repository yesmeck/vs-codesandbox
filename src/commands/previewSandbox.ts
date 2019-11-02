import * as vscode from 'vscode';

export default async function previewSandbox() {
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    console.log(folders[0]);
  await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://${folders[0].uri.authority}.csb.app`));
  }
}
