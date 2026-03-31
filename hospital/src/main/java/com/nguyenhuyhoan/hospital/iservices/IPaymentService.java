package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.PaymentDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.PaymentResponse;
import com.nguyenhuyhoan.hospital.models.Payment;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;

public interface IPaymentService {

    PaymentResponse createPayment(PaymentDTO dto) throws Exception;
    PaymentResponse processPaymentSuccess(String transactionId, String method) throws Exception;
    PaymentResponse getPaymentDetail(Long appointmentId) throws Exception;

    String createVNPayPayment(Long paymentId, HttpServletRequest request) throws UnsupportedEncodingException;

    // Cập nhật trạng thái sau khi có kết quả từ VNPay hoặc tiền mặt
    void updatePaymentStatus(Long paymentId, Payment.Status status, String transactionId) throws Exception;


    }
