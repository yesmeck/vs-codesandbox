import * as vscode from 'vscode';
import login from './commands/login';
import openSandbox from './commands/openSandbox';
import previewSandbox from './commands/previewSandbox';
import Client from './Client';
import FS from './fs';
import showInWebEditor from './commands/showInWebEditor';
import createSandbox from './commands/createSandbox';
import renameSandbox from './commands/renameSandbox';

export function activate(context: vscode.ExtensionContext) {
  const token = context.globalState.get<string>('token');
  const client = new Client(token);
  context.subscriptions.concat([
    vscode.workspace.registerFileSystemProvider('codesandboxfs', new FS(client), { isCaseSensitive: true }),
    vscode.commands.registerCommand('codesandbox.login', () => login(context, client)),
    vscode.commands.registerCommand('codesandbox.createSandbox', () => createSandbox(context, client)),
    vscode.commands.registerCommand('codesandbox.renameSandbox', () => renameSandbox(context, client)),
    vscode.commands.registerCommand('codesandbox.openSandbox', () => openSandbox(context, client)),
    vscode.commands.registerCommand('codesandbox.previewSandbox', previewSandbox),
    vscode.commands.registerCommand('codesandbox.showInWebEditor', showInWebEditor),
  ]);
}

export function deactivate() {}
