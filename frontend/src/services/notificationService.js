import api from './api';

export const notificationService = {
  // Lấy thông báo theo userId
  getByUserId: async (userId) => {
    const response = await api.get(`/v1/notifications/user/${userId}`);
    return response.data;
  },
  // Đánh dấu là đã đọc
  markAsRead: async (id) => {
    await api.put(`/v1/notifications/${id}/read`);
  }
};