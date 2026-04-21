import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    // Kiểm tra xem Backend của bạn có tiền tố /api không. 
    // Nếu Controller là @RequestMapping("/v1/specialty") thì baseURL chỉ nên là 'http://localhost:8080'
    baseURL: 'http://localhost:8080/api', 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor cho Request: Đính kèm Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Đảm bảo Token gửi đi có chữ Bearer chuẩn chỉnh
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// MỚI: Interceptor cho Response để bắt lỗi Token hết hạn (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Nếu Backend trả về 401 hoặc 403 (do ExpiredJwtException)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const errorMessage = error.response.data?.message || "";
            
            // Nếu đúng là lỗi hết hạn, xóa token và đẩy về trang login
            if (errorMessage.includes("expired") || error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                
                // Tránh reload liên tục nếu đang ở trang login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                    toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
                }
            }
        }
        return Promise.reject(error);
    }
);

// API Service cho Chuyên khoa
export const specialtyService = {
    getAll: async () => {
        try {
            // URL cuối cùng: http://localhost:8080/api/v1/specialty
            const response = await api.get('/v1/specialty');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch specialties:', error);
            throw error;
        }
    }
};

export default api;