import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Courier {
  _id: string;
  name: string;
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

export type CreateCourierPayload = Omit<Courier, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateCourierPayload = Partial<CreateCourierPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/couriers?page=&limit=&search=
export const fetchCouriers = async (params?: FetchParams): Promise<PaginatedResponse<Courier>> => {
  const { data } = await apiGet(endPointApi.couriers, params);
  return data;
};

// GET /api/couriers/:id
export const fetchCourier = async (id: string): Promise<Courier> => {
  const { data } = await apiGetById(endPointApi.couriers, id);
  return data;
};

// POST /api/couriers
export const createCourier = async (payload: CreateCourierPayload): Promise<Courier> => {
  const { data } = await apiPost(endPointApi.courierCreate, payload);
  return data;
};

// PUT /api/couriers/:id
export const updateCourier = async (id: string, payload: UpdateCourierPayload): Promise<Courier> => {
  const { data } = await apiPut(endPointApi.courierUpdate, id, payload);
  return data;
};

// DELETE /api/couriers/:id
export const deleteCourier = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.courierDelete, id);
};
