import api from './api';

export const appointmentService = {


    create: async (appointmentData) => {
        try {
            // Chuẩn bị payload khớp 100% với Postman Hoàn đã test
            const payload = {
                patient_id: appointmentData.patient_id,
                schedule_id: appointmentData.schedule_id,
                name: appointmentData.name,
                reason: appointmentData.reason,
                type: appointmentData.type || "IN_PERSON" // Dùng giá trị Postman đã chạy
            };

            console.log("🚀 Payload gửi đi:", payload);
            
            const response = await api.post('/v1/appointments', payload);
            return response.data;
        } catch (error) {
            // In ra chi tiết lỗi từ Backend để debug
            console.error('Lỗi chi tiết từ Server:', error.response?.data);
            throw error;
        }
    },
    getByPatient: async(patientId) => {
        
        const response = await api.get(`/v1/appointments/patient/${patientId}`);
        return response.data;

    },
    getById : async(id) =>{
        const response = await api.get(`/v1/appointments/${id}`);
        return response.data;
    },

    updateStatus: async(id, status) => {
        const response = await api.patch(`/v1/appointments/${id}/status`, null, {
            params : {status: status.toUpperCase()}
        });
        return response.data;
    },
   getByDoctor: async(doctorId) =>{
    const response = await api.get(`/v1/appointments/doctor/${doctorId}`);
    return response.data;
   }

}

