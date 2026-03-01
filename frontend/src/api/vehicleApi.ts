import axiosInstance from './axiosInstance';

// --- Types ---
export interface VehicleDto {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  vinNumber?: string;
  engineType?: string;
  fuelType?: string;
  mileage?: number;
  status: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VehicleQueryParams {
  search?: string;
  status?: string;
  brand?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- API ---
export const vehicleApi = {
  getAll: (params?: VehicleQueryParams) =>
    axiosInstance.get<PaginatedResult<VehicleDto>>('/api/vehicles', { params }),

  getById: (id: number) =>
    axiosInstance.get<VehicleDto>(`/api/vehicles/${id}`),

  create: (data: FormData) =>
    axiosInstance.post<VehicleDto>('/api/vehicles', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: FormData) =>
    axiosInstance.put<VehicleDto>(`/api/vehicles/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: number) =>
    axiosInstance.delete(`/api/vehicles/${id}`),
};
