import * as vscode from 'vscode';

export default async function showInWebEditor() {
  const folders = vscode.workspace.workspaceFolders;
  if (folders) {
    console.log(folders[0]);
  await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://codesandbox.io/s/${folders[0].uri.authority}`));
  }
}
