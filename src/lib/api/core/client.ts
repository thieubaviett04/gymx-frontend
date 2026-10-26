import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/authStore';

// Chuẩn hóa BASE_URL: loại bỏ dấu gạch chéo cuối và tránh trùng lặp /v1 khi ENDPOINTS đã có /v1
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5113/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/v1$/, '');
const BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

// Axios instance duy nhất cho toàn ứng dụng
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Tự động đính kèm Bearer Token trước mỗi request từ memory store
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

// ─── Mutex Lock & Queue cho Refresh Token (Chống Race Condition) ───────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 1. Unwrap response.data tự động (trả về data, không phải AxiosResponse)
// 2. Nếu nhận lỗi 401, áp dụng Mutex Lock + Queue để refresh token an toàn
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang có một request khác thực hiện refresh -> xếp hàng chờ
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi qua BFF Route Handler để đọc và làm mới HttpOnly Cookie an toàn
        const res = await axios.post('/api/auth/refresh');
        const newToken = res.data?.data?.accessToken;

        if (!newToken) throw new Error('Không nhận được access token mới');

        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
