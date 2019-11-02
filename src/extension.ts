// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import login from './commands/login';
import openSandbox from './commands/openSandbox';
import previewSandbox from './commands/previewSandbox';
import Client from './Client';
import FS from './fs';
import showInWebEditor from './commands/showInWebEditor';
import createSandbox from './commands/createSandbox';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const token = context.globalState.get<string>('token');
  const client = new Client(token);
  context.subscriptions.concat([
    vscode.workspace.registerFileSystemProvider('codesandboxfs', new FS(client), { isCaseSensitive: true }),
    vscode.commands.registerCommand('codesandbox.login', () => login(context, client)),
    vscode.commands.registerCommand('codesandbox.createSandbox', () => createSandbox(context, client)),
    vscode.commands.registerCommand('codesandbox.openSandbox', () => openSandbox(context, client)),
    vscode.commands.registerCommand('codesandbox.previewSandbox', previewSandbox),
    vscode.commands.registerCommand('codesandbox.showInWebEditor', showInWebEditor),
  ]);
}

// this method is called when your extension is deactivated
export function deactivate() {}
