import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';
import { ENDPOINTS } from '@/lib/api/endpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5113/api';

// Axios instance duy nhất cho toàn ứng dụng
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Tự động đính kèm Bearer Token trước mỗi request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 1. Unwrap response.data tự động (trả về data, không phải AxiosResponse)
// 2. Nếu nhận lỗi 401, thử Refresh Token một lần; nếu fail thì logout
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        // Gọi trực tiếp axios (không qua apiClient) để tránh vòng lặp interceptor
        const res = await axios.post(`${BASE_URL}${ENDPOINTS.auth.refreshToken}`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data?.data ?? res.data;

        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh Token cũng hết hạn → đăng xuất
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
