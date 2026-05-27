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

    updateStatus: async (id, status, cancellationReason) => {
        const payload = { status: String(status).toUpperCase() };
        const r = cancellationReason != null ? String(cancellationReason).trim() : '';
        if (r) payload.cancellationReason = r;
        const response = await api.patch(`/v1/appointments/${id}/status`, payload);
        return response.data;
    },
   getByDoctor: async(doctorId) =>{
    const response = await api.get(`/v1/appointments/doctor/${doctorId}`);
    return response.data;
   }
   ,getAll : async() =>{
    const response = await api.get(`/v1/appointments/all`);
    return response.data;
   },

   cancelAppointment : async(id, userId) =>{
    try {
        const response = await api.put(`/v1/appointments/${id}/cancel`,null, {
            params: {userId}
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Không thể hủy lịch khám";
        
    }

   }


}

