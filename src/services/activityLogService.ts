import { apiGet, endPointApi } from './api';

export interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  lead: string;
  action: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchActivityLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FetchActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const fetchActivityLogs = async (params?: FetchActivityLogsParams): Promise<FetchActivityLogsResponse> => {
  const { data } = await apiGet(endPointApi.activityLogs, params);
  return data;
};
