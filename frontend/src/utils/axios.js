import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach token and apiKey to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const apiKey = localStorage.getItem('apiKey');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (apiKey) {
            config.headers['x-api-key'] = apiKey;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('[Axios] 401 Unauthorized - removing token');
            localStorage.removeItem('token');
            localStorage.removeItem('apiKey');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.error('[Axios] 403 Forbidden - access denied');
        } else if (error.response?.status === 429) {
            console.warn('[Axios] 429 Too Many Requests - rate limited');
        } else if (error.response?.status === 500) {
            console.error('[Axios] 500 Server Error');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
