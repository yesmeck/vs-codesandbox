import axios, { AxiosRequestConfig } from 'axios';
import { verifyUserTokenUrl } from '../out/url';

const callApi = async (options: AxiosRequestConfig) => {
  try {
    const response = await axios(options);
    return response.data.data;
  } catch (e) {
    if (e.response && e.response.data && e.response.data.errors) {
      e.message = Object.values(e.response.data.errors)[0];
    }
    throw e;
  }
};

export async function verifyUser(token: string) {
  const options: AxiosRequestConfig = {
    method: 'GET',
    url: verifyUserTokenUrl(token),
  };

  return callApi(options);
}
