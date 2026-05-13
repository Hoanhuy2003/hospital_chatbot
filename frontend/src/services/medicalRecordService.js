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
    getById : async(id) =>{
        const response = await api.get(`/v1/medical_records/${id}`);
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
    },
    getByDoctor : async(doctorId) =>{
        const response = await api.get(`/v1/medical_records/doctor/${doctorId}`);
        return response.data;
    }
    ,getNextAppointment : async(doctorId) =>{
        const response = await api.get(`/v1/medical_records/doctor/${doctorId}/next-appointments`);
        return response.data;

    }, 
    getByAppointment : async(appointmentId) =>{
        const response = await api.get(`/v1/medical_records/appointment/${appointmentId}`);
        return response.data;
    }


}