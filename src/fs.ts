import * as vscode from 'vscode';
import * as path from 'path';
import Client from './client';
import { Sandbox, Directory, Module } from './type';

function isModule(file: any): file is Module {
  return 'code' in file;
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
    if (!file) {
      throw vscode.FileSystemError.FileNotFound(uri.path);
    }
    return {
      ctime: new Date(file.updated_at).getTime(),
      mtime: new Date(file.inserted_at).getTime(),
      size: isModule(file) ? file.code.length : 0,
      type: isModule(file) ? vscode.FileType.File : vscode.FileType.Directory,
    };
  }

  async readDirectory(uri: vscode.Uri) {
    const dir = await this.lookup(uri);
    if (!dir) {
      throw vscode.FileSystemError.FileNotFound(uri.path);
    }
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

  async createDirectory(uri: vscode.Uri) {
    const basename = path.basename(uri.path);
    const dirname = uri.with({ path: path.dirname(uri.path) });
    const parent = await this.lookup(dirname);
    if (!parent) {
      throw vscode.FileSystemError.FileNotFound(dirname.path);
    }
    const directory = await this.client.createDirectory(uri.authority, {
      title: basename,
      directory_shortid: parent.shortid,
    });
    this.sandbox!.directories.push(directory);
  }

  async readFile(uri: vscode.Uri) {
    const file = (await this.lookup(uri)) as Module;
    return Buffer.from(file.code, 'utf8');
  }

  async writeFile(uri: vscode.Uri, content: Uint8Array) {
    const file = await this.lookup(uri);
    if (file) {
      await this.client.updateModule(uri.authority, file.shortid!, { code: content.toString() });
    } else {
      const basename = path.basename(uri.path);
      const dirname = uri.with({ path: path.dirname(uri.path) });
      const parent = await this.lookup(dirname);
      if (!parent) {
        throw vscode.FileSystemError.FileNotFound(dirname.path);
      }
      const module = await this.client.createModule(uri.authority, {
        code: '',
        directory_shortid: parent.shortid,
        is_binary: false,
        title: basename,
      });
      module.code = '';
      this.sandbox!.modules.push(module);
    }
  }

  async delete(uri: vscode.Uri, options: { recursive: boolean }) {
    const file = await this.lookup(uri);
    if (!file) {
      throw vscode.FileSystemError.FileNotFound(uri.path);
    }
    if (isModule(file)) {
      this.sandbox!.modules.splice(this.sandbox!.modules.indexOf(file), 1);
      await this.client.deleteModule(uri.authority, file.shortid!);
    } else {
      this.sandbox!.directories.splice(this.sandbox!.directories.indexOf(file), 1);
      await this.client.deleteDirectory(uri.authority, file.shortid!);
    }
  }

  async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }) {
    const file = await this.lookup(oldUri);
    if (!file) {
      throw vscode.FileSystemError.FileNotFound(oldUri.path);
    }
    const basename = path.basename(newUri.path);
    file.title = basename;
    if (isModule(file)) {
      await this.client.updateModule(oldUri.authority, file.shortid!, { title: basename });
    } else {
      await this.client.updateDirectory(oldUri.authority, file.shortid!, { title: basename });
    }
  }

  async lookup(uri: vscode.Uri): Promise<Directory | Module | undefined> {
    if (!this.sandbox) {
      this.sandbox = await vscode.window.withProgress(
        {
          title: 'Loading sandbox...',
          location: vscode.ProgressLocation.Notification,
        },
        () => this.client.fetchSandbox(uri.authority),
      );
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
    };

    let file: Directory | Module | undefined;
    let folder = files.shift();
    while (folder) {
      file = findFile(folder, file ? file.shortid : null);
      folder = files.shift();
    }

    if (file) {
      return file;
    }
  }
}
