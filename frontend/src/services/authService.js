import api from './api';

export const authService = {
    login: async (phone, password) => {
        const response = await api.post('/auth/login', { phone, password });
        return response.data;
    }
};