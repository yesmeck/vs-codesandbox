import * as vscode from 'vscode';
import { format } from 'date-fns';
import * as sander from 'sander';
import Client from '../Client';
import { SimpleSandbox } from '../type';
import { WORKSPACE_DIR } from '../paths';
import { join } from 'path';
import open from '../open';

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
  open(selection.sandbox);
}
