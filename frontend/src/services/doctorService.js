 import api from './api';

 export const doctorService = {

    getAll: async (keyword = '', specialtyId ='')=>{
        try{
            const response = await api.get('/v1/doctors',{
                params:{keyword, specialtyId}
            });
            return response.data;

        } catch( error){
            console.error('Failed');
            throw error;
        }
        
    },

    getDoctorById: async (id)=> {
        try{
            const response = await api.get(`/v1/doctors/${id}`);
            return response.data;
        }catch (error){
            console.error('Failed');
            throw error;
        }

    },
    getDoctorByClinic: async(clinicId) =>{
        const response = await api.get(`/v1/doctors/clinic/${clinicId}`);
        return response.data;
    },
    createDoctor : async(doctorData) =>{
        try {
            const formData = new FormData();
            Object.keys(doctorData).forEach(key =>{
                if(doctorData[key] !== null && doctorData[key] !== undefined){
                    formData.append(key, doctorData[key]);
                }

            });

            const response = await api.post(`/v1/doctors/promote`, formData, {
                headers: {'Content-Type': 'multipart/form-data'}
            } );

            return response.data;
            
            
        } catch (error) {
            console.error('Failed');
            throw error;
            
        }
    },

    updateDoctor : async(id, doctorData) =>{
        try {
            const formData = new FormData();
            Object.keys(doctorData).forEach(key =>{
                if (doctorData[key] !== '' && doctorData[key] !== null && doctorData[key] !== undefined){
                    formData.append(key, doctorData[key]);
                }
            });
            const response = await api.put(`/v1/doctors/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;

            
        } catch (error) {
            console.error('Failed');
            throw error;
            
        }
    }
    
 }