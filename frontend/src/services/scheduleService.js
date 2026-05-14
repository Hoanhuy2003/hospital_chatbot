import api from './api'

export const scheduleService = {
  getScheduleByDoctorAndDate: async (doctorId, date) => {
    const response = await api.get(`/v1/schedules/doctor/${doctorId}`, { params: { date } });
    return response.data;
  },

  // Lấy lịch nhóm theo buổi sáng/chiều — dùng trong DoctorSchedule để hiển thị lịch đã đăng ký
  getGroupedSchedule: async (doctorId, date) => {
    const response = await api.get(`/v1/schedules/doctorsch/${doctorId}`, { params: { date } });
    return response.data; // List<GroupedScheduleResponse>: [{ morning: [...], afternoon: [...] }]
  },

  // Đăng ký lịch trực — dùng trong DoctorSchedule.jsx
  createSchedule: async (payload) => {
    const response = await api.post('/v1/schedules', payload);
    return response.data;
  },

  getDoctorTemplates: async (doctorId) => {
    const response = await api.get(`/v1/schedules/templates/doctor/${doctorId}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/v1/schedules/doctor/${doctorId}/available-slots`, { params: { date } });
    return response.data;
  },

  // Alias dùng trong useSlots.js
  getDoctorSchedule: async (doctorId, date) => {
    const response = await api.get(`/v1/schedules/doctor/${doctorId}`, { params: { date } });
    return response.data;
  },
}