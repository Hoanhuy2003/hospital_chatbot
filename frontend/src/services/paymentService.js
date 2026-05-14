import api from './api';

export const paymentService = {
  /**
   * Tạo URL thanh toán VNPay cho hóa đơn.
   * Backend trả về { paymentUrl: "https://sandbox.vnpayment.vn/..." }
   */
  createPaymentUrl: async (invoiceId) => {
    const res = await api.get(`/v1/payment/create/${invoiceId}`);
    return res.data.paymentUrl;
  },
};
