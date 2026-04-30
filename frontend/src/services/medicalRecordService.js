import api from './api';

export const medicalRecordService = {
    create : async (payload) =>{
        const response = await api.post('/v1/medical_records', payload);
        return response.data;
    },

    getHistory: async (patientId) =>{
        const response = await api.get(`/v1/medical_records/patient/${patientId}`);
        return response.data;
    },
    getId : async(id) =>{
        const response = await api.get(`/v1/medical_record/${id}`);
        return response.data;
    },
    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append('file', file); // 'file' phải khớp với @RequestParam("file") ở Java
        const response = await api.post('/v1/medical_records/upload-photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Trả về link string của ảnh
    }

}