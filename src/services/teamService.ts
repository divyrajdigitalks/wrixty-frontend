import { apiGet, apiGetById, apiPost, apiPut, apiDelete, endPointApi } from './api';

export interface Team {
  _id: string;
  name: string;
  head: string;
  member: string[];
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

export type CreateTeamPayload = Omit<Team, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
}

// GET /api/teams?page=&limit=&search=
export const fetchTeams = async (params?: FetchParams): Promise<PaginatedResponse<Team>> => {
  const { data } = await apiGet(endPointApi.teams, params);
  return data;
};

// GET /api/teams/:id
export const fetchTeam = async (id: string): Promise<Team> => {
  const { data } = await apiGetById(endPointApi.teams, id);
  return data;
};

// POST /api/teams
export const createTeam = async (payload: CreateTeamPayload): Promise<Team> => {
  const { data } = await apiPost(endPointApi.teamCreate, payload);
  return data;
};

// PUT /api/teams/:id
export const updateTeam = async (id: string, payload: UpdateTeamPayload): Promise<Team> => {
  const { data } = await apiPut(endPointApi.teamUpdate, id, payload);
  return data;
};

// DELETE /api/teams/:id
export const deleteTeam = async (id: string): Promise<void> => {
  await apiDelete(endPointApi.teamDelete, id);
};

// GET /api/teams/export
export const exportTeams = async (search?: string): Promise<Team[]> => {
  const { data } = await apiGet(endPointApi.teamExport, search ? { search } : undefined);
  return data;
};
