import api from './api'

const chatbotService = {
  /**
   * Gửi tin nhắn tới Spring Boot → Python AI
   * userId có thể là null nếu chưa đăng nhập (không lưu lịch sử)
   */
  sendMessage: async (message, userId = null) => {
    const res = await api.post('/v1/chatbots/chat', { userId, message })
    return res.data  // plain string
  },
}

export default chatbotService
