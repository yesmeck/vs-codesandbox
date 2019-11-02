import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BASE_URL } from './url';
import { SimpleSandbox, Sandbox, Directory, Module } from './type';

function getData(res: AxiosResponse) {
  return res.data.data;
}

export default class Client {
  request: AxiosInstance;

  constructor(token: string | undefined) {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    this.request = axios.create({
      baseURL: BASE_URL + '/api/v1',
      headers,
    });
  }

  async verifyUser(token: string) {
    const res = await this.request.get(`/auth/verify/${token}`);
    return getData(res);
  }

  async fetchSandboxes(): Promise<SimpleSandbox[]> {
    const res = await this.request.get('/sandboxes');
    return getData(res);
  }

  async fetchSandbox(id: string): Promise<Sandbox> {
    const res = await this.request.get(`/sandboxes/${id}`);
    return getData(res);
  }

  async createModule(id: string, module: any): Promise<Module> {
    const res = await this.request.post(`/sandboxes/${id}/modules`, {
      module,
    });
    return getData(res);
  }

  async updateModule(id: string, moduleId: string, module: any) {
    return await this.request.put(`/sandboxes/${id}/modules/${moduleId}`, {
      module,
    });
  }

  async deleteModule(id: string, moduleId: string) {
    return await this.request.delete(`/sandboxes/${id}/modules/${moduleId}`);
  }

  async createDirectory(id: string, directory: any): Promise<Directory> {
    const res = await this.request.post(`/sandboxes/${id}/directories`, {
      directory,
    });
    return getData(res);
  }

  async deleteDirectory(id: string, dirId: string) {
    return await this.request.delete(`/sandboxes/${id}/directories/${dirId}`);
  }

  async updateDirectory(id: string, dirId: string, directory: any) {
    return await this.request.put(`/sandboxes/${id}/directories/${dirId}`, {
      directory,
    });
  }
}
