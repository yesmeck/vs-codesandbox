import * as vscode from 'vscode';
import { format } from 'date-fns';
import * as sander from 'sander';
import Client from '../Client';
import { SimpleSandbox } from '../type';
import { WORKSPACE_DIR } from '../paths';
import { join } from 'path';

function createWorkspaceFile(sandbox: SimpleSandbox) {
  const settings = {
    folders: [{ name: `🚧 ${sandbox.title || sandbox.id}`, uri: `codesandboxfs://${sandbox.id}` }],
    settings: {
      'editor.defaultFormatter': 'codesandbox.codesandbox',
      'files.autoSave': 'afterDelay',
      'files.autoSaveDelay': 1000,
      'files.eol': '\n',
      'files.exclude': {
        '**/.vscode-codesandbox/cache/**': true,
      },
      'files.trimTrailingWhitespace': false,
      'git.autoRepositoryDetection': false,
    },
  };
  const workspaceFile = join(
    WORKSPACE_DIR,
    `Codesandbox: ${[sandbox.title, sandbox.id].filter(Boolean).join('-')}.code-workspace`,
  );
  sander.writeFileSync(workspaceFile, JSON.stringify(settings, null, 2));
  return workspaceFile;
}

export default async function openSandbox(context: vscode.ExtensionContext, client: Client) {
  const token = context.globalState.get<string>('token');
  if (!token) {
    return vscode.window.showInformationMessage('Please login');
  }
  const sandboxes = await vscode.window.withProgress(
    {
      title: 'Fetching sandboxes...',
      location: vscode.ProgressLocation.Notification,
    },
    client.fetchSandboxes.bind(client),
  );
  const selection = await vscode.window.showQuickPick(
    sandboxes.map(s => ({
      label: s.title || s.id,
      detail: 'Updated at ' + format(new Date(s.updated_at), 'yyyy-MM-dd HH:mm:ss'),
      sandbox: s,
    })),
    { placeHolder: 'Pick a sandbox' },
  );
  if (!selection) {
    return;
  }
  const workspaceFile = createWorkspaceFile(selection.sandbox);
  vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(workspaceFile));
}
