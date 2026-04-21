import api from './api';

export const appointmentService = {


    creat: async(appointmentData) =>{
        try {
            const response = await api.post('/appointments', appointmentData);
            return response.data;
            
        } catch (error) {
            console.error('Lỗi đặt lịch: ',error);
            throw error;
            
            
        }
    },

    getByPatient: async(patientId) => {
        
        const response = await api.get(`/appointments/patient/${patientId}`);
        return response.data;

    }
}

