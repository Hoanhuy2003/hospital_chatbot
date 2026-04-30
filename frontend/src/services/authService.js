import api from './api';

export const authService = {
    login: async (phone, password) => {
        const response = await api.post('/auth/login', { phone, password });
        return response.data;
    },
    register : async(userData) =>{
        const payload = {
            full_name : userData.fullName,
            phone : userData.phone,
            email : userData.email,
            password : userData.password,
            retype_password : userData.retypePassword,
            date_of_birth : userData.dateOfBirth,
            gender : userData.gender
            
        };
        try {
            const response = await api.post('/auth/register', payload);
            return response.data;
        } catch (error) {
            // Ném lỗi cụ thể từ Backend về để hiển thị Toast
            throw error.response?.data || { message: 'Đăng ký thất bại' };
        }
    }
};