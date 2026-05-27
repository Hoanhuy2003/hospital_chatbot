import api from './api'

const chatbotService = {
  /**
   * Gửi tin nhắn tới Spring Boot → Python AI
   * userId có thể là null nếu chưa đăng nhập (không lưu lịch sử)
   * @returns {Promise<{ reply: string } | { error: string }>}
   */
  sendMessage: async (message, userId = null) => {
    try {
      const res = await api.post('/v1/chatbots/chat', { userId, message })
      const data = res.data ?? {}
      if (data.error) {
        return {
          error:
            typeof data.error === 'string'
              ? data.error
              : 'Máy chủ trả về lỗi không xác định.',
        }
      }
      const reply = data.reply
      if (reply == null || String(reply).trim() === '') {
        return { error: 'Không nhận được nội dung trả lời từ máy chủ.' }
      }
      return { reply: String(reply) }
    } catch (err) {
      const fromBody = err.response?.data?.error
      const msg =
        typeof fromBody === 'string'
          ? fromBody
          : err.message || 'Không thể kết nối tới máy chủ.'
      return { error: msg }
    }
  },
}

export default chatbotService
