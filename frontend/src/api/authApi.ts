import axiosInstance from './axiosInstance';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  expiration: string;
  username: string;
  role: string;
}

export const authApi = {
  login: (data: LoginDto) =>
    axiosInstance.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterDto) =>
    axiosInstance.post<AuthResponse>('/api/auth/register', data),
};
