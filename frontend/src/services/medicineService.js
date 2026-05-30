import api from './api';

export const medicineService = {
    // Lấy danh sách thuốc lọc theo chuyên khoa (Mắt, Tai mũi họng...)
    getBySpecialty: async (specialtyId) => {
        const response = await api.get(`/v1/medicines/specialty/${specialtyId}`);
        return response.data;
    },

    /** Thuốc đúng chuyên khoa bác sĩ đang đăng nhập (ưu tiên dùng khi kê đơn). */
    getForDoctor: async () => {
        const response = await api.get('/v1/medicines/for-doctor');
        return response.data;
    },
    
    // Nếu muốn lấy tất cả thuốc
    getAll: async () => {
        const response = await api.get('/v1/medicines');
        return response.data;
    }
};