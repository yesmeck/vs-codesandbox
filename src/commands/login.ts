import * as vscode from 'vscode';
import { LOGIN_URL } from '../url';
import Client from '../Client';

export default async function login(context: vscode.ExtensionContext, client: Client) {
  await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(LOGIN_URL));
  const authToken = await vscode.window.showInputBox({
    placeHolder: 'Paste code here',
  });
  if (authToken) {
    try {
      const { token, user } = await client.verifyUser(authToken);
      vscode.window.showInformationMessage(`Login as ${user.username}.`);
      context.globalState.update('token', token);
    } catch (e) {
      vscode.window.showErrorMessage('Login failed.');
    }
  }
}
