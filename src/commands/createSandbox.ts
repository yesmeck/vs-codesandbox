import * as vscode from 'vscode';
import * as templates from '@codesandbox/common/lib/templates';
import { sortBy } from 'lodash';
import Client from '../client';
import open from '../open';

export default async function createSandbox(context: vscode.ExtensionContext, client: Client) {
  const presets = [
    {
      ...templates.react,
      variantName: templates.react.niceName,
      niceName: 'React + TS',
      shortid: 'react-ts',
    },
    {
      ...templates.parcel,
      variantName: templates.parcel.niceName,
      niceName: 'Vanilla + TS',
      shortid: 'vanilla-ts',
    },
  ];

  const usedTemplates = sortBy(
    Object.keys(templates)
      .filter(x => x !== 'default')
      .map(t => (templates as any)[t])
      .filter(t => t.showOnHomePage)
      .concat(presets),
    'niceName',
  );

  const selection = await vscode.window.showQuickPick(
    usedTemplates.map(t => ({
      template: t,
      label: t.niceName,
      detail: t.url || '',
    })),
    { placeHolder: 'Select a template' },
  );
  if (!selection) {
    return;
  }
  const sandbox = await client.fetchSandbox(selection.template.shortid);
  const forkedSandbox = await client.forkSandbox(sandbox.id);
  open(forkedSandbox);
}
