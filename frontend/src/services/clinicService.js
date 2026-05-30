import api from './api';

export const clinicService = {

    getAll: async (params = {}) => {
        try {
            const response = await api.get('/v1/clinics', { params })
            return response.data
        } catch (error) {
            console.error('Failed to fetch clinics:', error)
            throw error
        }
    },

    /** Lấy toàn bộ phòng khám (mọi trang). */
    getAllList: async () => {
        const probe = await api.get('/v1/clinics', { params: { page: 0, size: 1 } })
        const body = probe.data
        const total = body?.totalElements
        if (typeof total === 'number' && total > 0) {
            const full = await api.get('/v1/clinics', { params: { page: 0, size: total } })
            return full.data?.content ?? []
        }
        if (Array.isArray(body)) return body
        return body?.content ?? []
    },
    getById : async(id) =>{
        const response = await api.get(`/v1/clinics/${id}`)
        return response.data;

    }

}