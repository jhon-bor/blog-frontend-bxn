import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-storage');
      if (token) {
        const { state } = JSON.parse(token);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  me: () => api.get('/auth/me'),
  refresh: (token: string) => api.post('/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const postsAPI = {
  list: (params?: { page?: number; limit?: number; category?: string; tag?: string }) =>
    api.get('/posts', { params }),
  get: (slug: string) => api.get(`/posts/${slug}`),
  create: (data: any) => api.post('/posts', data),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

export const categoriesAPI = {
  list: () => api.get('/categories'),
  get: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const tagsAPI = {
  list: () => api.get('/tags'),
  get: (slug: string) => api.get(`/tags/${slug}`),
  create: (data: any) => api.post('/tags', data),
  update: (id: string, data: any) => api.put(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const uploadAPI = {
  upload: (file: File, provider?: 'minio' | 'qiniu') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      params: { provider },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string, provider?: 'minio' | 'qiniu') =>
    api.delete(`/upload/${id}`, { params: { provider } }),
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/upload', { params }),
};

export const searchAPI = {
  search: (query: string, engine: 'elasticsearch' | 'solr' = 'elasticsearch') =>
    api.get('/search', { params: { q: query, engine } }),
  suggest: (query: string) => api.get('/search/suggest', { params: { q: query } }),
};

export const starlinkAPI = {
  list: () => api.get('/starlink'),
  sync: (links: any[]) => api.post('/starlink/sync', { links }),
  create: (data: any) => api.post('/starlink', data),
  update: (id: string, data: any) => api.put(`/starlink/${id}`, data),
  delete: (id: string) => api.delete(`/starlink/${id}`),
};

export default api;