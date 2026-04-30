import api from './api';

export const medicineService = {
    // Lấy danh sách thuốc lọc theo chuyên khoa (Mắt, Tai mũi họng...)
    getBySpecialty: async (specialtyId) => {
        const response = await api.get(`/v1/medicines/specialty/${specialtyId}`);
        return response.data;
    },
    
    // Nếu muốn lấy tất cả thuốc
    getAll: async () => {
        const response = await api.get('/v1/medicines');
        return response.data;
    }
};