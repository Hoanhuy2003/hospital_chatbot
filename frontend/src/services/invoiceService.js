import api from './api';

export const invoiceService = {
    create : async (data) => {
        const response = await api.post(`/v1/invoices/create`, data);
        return response.data;
    },

    getById : async(id) =>{
        const response = await api.get(`/v1/invoices/${id}`);
        return response.data;
    },
    getByMedicalRecord : async(medicalRecordId) =>{
        const response = await api.get(`/v1/invoices/medical_record/${medicalRecordId}`);
        return response.data;
    }
}