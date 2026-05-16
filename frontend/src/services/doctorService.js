import api from './api'

export const doctorService = {
  getAll: async (params = {}) => {
    const res = await api.get('/v1/doctors', { params })
    return res.data
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
