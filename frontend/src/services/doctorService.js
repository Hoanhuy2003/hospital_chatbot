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

    }
    
 }