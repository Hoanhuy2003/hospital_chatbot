import api from './api'

export const scheduleService ={
  getScheduleByDoctorAndDate : async(doctorId, date) =>{
    const response = await api.get(`/v1/schedules/doctor/${doctorId}`, {
  params: { date },
})

    return response.data
  },

  getDoctorTemplates: async (doctorId) => {
    const response = await api.get(`/v1/schedules/templates/doctor/${doctorId}`);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    // API: /api/v1/schedules/doctor/7/available-slots?date=2026-04-22
    const response = await api.get(`/v1/schedules/doctor/${doctorId}/available-slots`, {
      params: { date }
    });
    return response.data; // Trả về đối tượng { doctorId, date, availableTimeSlots: [...] }
  }
}