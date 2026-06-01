import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Role {
  _id: string;
  name: string;
  permissions: Record<string, boolean>;
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

export type CreateRolePayload = Omit<Role, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateRolePayload = Partial<CreateRolePayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/roles?page=&limit=&search=
export const fetchRoles = async (params?: FetchParams): Promise<PaginatedResponse<Role>> => {
  const { data } = await apiGet(endPointApi.roles, params);
  return data;
};

// GET /api/roles/:id
export const fetchRole = async (id: string): Promise<Role> => {
  const { data } = await apiGetById(endPointApi.roles, id);
  return data;
};

// POST /api/roles
export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const { data } = await apiPost(endPointApi.roleCreate, payload);
  return data;
};

// PUT /api/roles/:id
export const updateRole = async (id: string, payload: UpdateRolePayload): Promise<Role> => {
  const { data } = await apiPut(endPointApi.roleUpdate, id, payload);
  return data;
};

// DELETE /api/roles/:id
export const deleteRole = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.roleDelete, id);
};

// GET /api/roles/export?search=
export const exportRoles = async (search?: string): Promise<Role[]> => {
  const { data } = await apiGet(endPointApi.roleExport, search ? { search } : undefined);
  return data;
};
