import { apiPost, endPointApi } from './api';

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  token: string;
}

export const loginUser = async (payload: { email: string; password?: string }): Promise<AuthResponse> => {
  const { data } = await apiPost(endPointApi.authLogin, payload);
  return data;
};
