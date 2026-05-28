import api from './api'

export const doctorService = {
  getAll: async (params = {}) => {
    const res = await api.get('/v1/doctors', { params })
    return res.data
  },

  /** Lấy toàn bộ bác sĩ (bỏ giới hạn 12/trang mặc định của API). */
  getAllList: async (params = {}) => {
    const probe = await api.get('/v1/doctors', { params: { ...params, page: 0, size: 1 } })
    const body = probe.data
    const total = body?.totalElements
    if (typeof total === 'number' && total > 0) {
      const full = await api.get('/v1/doctors', { params: { ...params, page: 0, size: total } })
      return full.data?.content ?? []
    }
    if (Array.isArray(body)) return body
    return body?.content ?? []
  },

  getDoctorById: async (id) => {
    const res = await api.get(`/v1/doctors/${id}`)
    return res.data
  },

  getDoctorByClinic: async (clinicId) => {
    const res = await api.get(`/v1/doctors/clinic/${clinicId}`)
    return res.data
  },
  updateDoctor: async (id, formData) =>{
    const response = await api.put(`/v1/doctor/${id}`, formData, {

      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
}
