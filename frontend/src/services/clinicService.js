import api from './api';

export const clinicService = {

    getAll: async () => {
        try {
            const response = await api.get('/v1/clinics')
            return response.data;
            
            
        } catch (error) {
            console.error ('Failed');
            throw error;
            
        }

    }
}