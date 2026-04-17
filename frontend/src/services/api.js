import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Bỏ v1 đi
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// API để lấy chuyên khoa
export const specialtyService = {
    getAll: async () => {
        try {
            const response = await api.get('/v1/specialty');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch specialties:', error);
            throw error;
        }
    }
};

export default api;