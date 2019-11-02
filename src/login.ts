import * as vscode from 'vscode';
import { LOGIN_URL } from './url';
import { verifyUser } from './api';

export default async function login(context: vscode.ExtensionContext) {
  // The code you place here will be executed every time your command is executed

  // Display a message box to the user
  await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(LOGIN_URL));
  const authToken = await vscode.window.showInputBox({
    placeHolder: 'Paste code here',
  });
  if (authToken) {
    try {
      const { token, user } = await verifyUser(authToken);
      vscode.window.showInformationMessage(`Login as ${user.username}.`);
      context.globalState.update('token', token);
    } catch (e) {
      vscode.window.showErrorMessage('Login failed.');
    }
  }
}
