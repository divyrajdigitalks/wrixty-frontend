import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  company_number: string;
  aadhar_card: string;
  check_photo?: string;
  bank_number: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateUserPayload = Omit<User, '_id' | 'createdAt' | 'updatedAt'> & { password?: string };
export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/users?page=&limit=&search=
export const fetchUsers = async (params?: FetchParams): Promise<PaginatedResponse<User>> => {
  const { data } = await apiGet(endPointApi.users, params);
  return data;
};

// GET /api/users/:id
export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await apiGetById(endPointApi.users, id);
  return data;
};

// POST /api/users
export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await apiPost(endPointApi.userCreate, payload);
  return data;
};

// PUT /api/users/:id
export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
  const { data } = await apiPut(endPointApi.userUpdate, id, payload);
  return data;
};

// DELETE /api/users/:id
export const deleteUser = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.userDelete, id);
};
