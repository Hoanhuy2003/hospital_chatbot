package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.PaymentDTO;
import com.nguyenhuyhoan.hospital.iservices.IPaymentService;
import com.nguyenhuyhoan.hospital.models.Payment;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("")
    public ResponseEntity<?> create( @RequestBody PaymentDTO paymentDTO)throws Exception{
        try {
            return ResponseEntity.ok(paymentService.createPayment(paymentDTO));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam String transactionId, @RequestParam String method) {
        try {
            return ResponseEntity.ok(paymentService.processPaymentSuccess(transactionId, method));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(@PathVariable Long appointmentId) {
        try {
            return ResponseEntity.ok(paymentService.getPaymentDetail(appointmentId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/vnpay-url")
    public ResponseEntity<String> getVNPayUrl(@PathVariable Long id, HttpServletRequest request) throws UnsupportedEncodingException {
        String url = paymentService.createVNPayPayment(id, request);
        return ResponseEntity.ok(url);
    }


    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) throws Exception{
        String status = request.getParameter("vnp_ResponseCode");
        String paymentId = request.getParameter("vnp_TxnRef");
        String transactionNo = request.getParameter("vnp_TransactionNo");

        if ("00".equals(status)) {
            // Thanh toán thành công (00 là mã thành công của VNPay)
            paymentService.updatePaymentStatus(Long.valueOf(paymentId), Payment.Status.PAID, transactionNo);
            return ResponseEntity.ok("Thanh toán thành công!");
        } else {
            paymentService.updatePaymentStatus(Long.valueOf(paymentId), Payment.Status.FAILED, transactionNo);
            return ResponseEntity.badRequest().body("Thanh toán thất bại hoặc đã bị hủy.");
        }
    }


}
