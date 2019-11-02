import * as vscode from 'vscode';
import * as sander from 'sander';
import { join } from 'path';
import { WORKSPACE_DIR } from './paths';

function createWorkspaceFile(sandbox: { title: string, id: string }) {
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

export default function open(sandbox: { title: string, id: string }) {
  const workspaceFile = createWorkspaceFile(sandbox);
  vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(workspaceFile));
}
