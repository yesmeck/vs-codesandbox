import * as vscode from 'vscode';
import Client from './client';
import { Sandbox, Directory, Module } from './type';

function isModule(file: any): file is Module {
  return !!file.code;
}

export default class FS implements vscode.FileSystemProvider {
  emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this.emitter.event;
  client: Client;
  sandbox?: Sandbox;

  constructor(client: Client) {
    this.client = client;
  }

  watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[] }): vscode.Disposable {
    return new vscode.Disposable(() => {});
  }

  async stat(uri: vscode.Uri) {
    const file = await this.lookup(uri);
    return {
      ctime: new Date(file.updated_at).getTime(),
      mtime: new Date(file.inserted_at).getTime(),
      size: isModule(file) ? file.code.length : 0,
      type: isModule(file) ? vscode.FileType.File : vscode.FileType.Directory,
    };
  }

  async readDirectory(uri: vscode.Uri) {
    const dir = await this.lookup(uri);
    const result: [string, vscode.FileType][] = [];
    this.sandbox!.directories.forEach(d => {
      if (d.directory_shortid === dir.shortid) {
        result.push([d.title, vscode.FileType.Directory]);
      }
    });
    this.sandbox!.modules.forEach(m => {
      if (m.directory_shortid === dir.shortid) {
        result.push([m.title, vscode.FileType.File]);
      }
    });
    return result;
  }

  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    throw new Error(`createDirectory not implemented.`);
  }

  async readFile(uri: vscode.Uri) {
    console.log(uri);
    const file = (await this.lookup(uri)) as Module;
    console.log(file);
    return Buffer.from(file.code, 'utf8');
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean },
  ): void | Thenable<void> {
    throw new Error(`writeFile not implemented.`);
  }

  delete(uri: vscode.Uri, options: { recursive: boolean }): void | Thenable<void> {
    throw new Error(`delete not implemented.`);
  }

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void | Thenable<void> {
    throw new Error(`renam not implemented.`);
  }

  async lookup(uri: vscode.Uri): Promise<Directory | Module> {
    if (!this.sandbox) {
      this.sandbox = await this.client.fetchSandbox(uri.authority);
    }
    if (uri.path === '/') {
      return {
        updated_at: this.sandbox.updated_at,
        title: '/',
        inserted_at: this.sandbox.updated_at,
        source_id: '',
        shortid: null,
        id: '',
        directory_shortid: '',
      };
    }
    const files = uri.path.replace(/^\//, '').split('/');
    const findFile = (name: string, dirId: string | null) => {
        const module = this.sandbox!.modules.find(m => m.title === name && m.directory_shortid === dirId);
        if (module) {
          return module;
        }
        const dir = this.sandbox!.directories.find(m => m.title === name && m.directory_shortid === dirId);
        if (dir) {
          return dir;
        }
    }

    let file: Directory | Module | undefined;
    let folder = files.shift();
    while (folder) {
      file = findFile(folder, file ? file.shortid : null);
      folder = files.shift();
    }

    if (file) {
      return file;
    }

    throw vscode.FileSystemError.FileNotFound(uri.path);
  }
}
