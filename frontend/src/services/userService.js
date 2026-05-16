import api from './api';

export const userService = {
  getById: async (id) => {
    const res = await api.get(`/v1/users/${id}`);
    return res.data;
  },

  update: async (id, data) => {
    const payload = {
      full_name:                data.fullName,
      phone:                    data.phone,
      email:                    data.email,
      date_of_birth:            data.dateOfBirth || null,
      address:                  data.address,
      gender:                   data.gender || null,
      avatar_url:               data.avatarUrl || null,
      // Bảo hiểm y tế
      health_insurance_number:  data.healthInsuranceNumber || null,
      insurance_expiry_date:    data.insuranceExpiryDate   || null,
      insurance_benefit_level:  data.insuranceBenefitLevel != null
                                  ? Number(data.insuranceBenefitLevel)
                                  : null,
    };
    const res = await api.put(`/v1/users/${id}`, payload);
    return res.data;
  },
};
