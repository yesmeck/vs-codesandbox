import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BASE_URL } from './url';
import { SimpleSandbox, Sandbox } from './type';

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
}
