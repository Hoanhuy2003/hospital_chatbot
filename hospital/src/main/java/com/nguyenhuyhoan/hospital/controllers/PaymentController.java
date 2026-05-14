package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceDetailResponse;
import com.nguyenhuyhoan.hospital.iservices.IInvoiceService;
import com.nguyenhuyhoan.hospital.services.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final IInvoiceService invoiceService;

    @Value("${vnpay.frontend-result-url}")
    private String frontendResultUrl;

    /**
     * Tạo URL thanh toán VNPay.
     * Frontend gọi GET /api/v1/payment/create/{invoiceId} → nhận paymentUrl → redirect.
     */
    @GetMapping("/create/{invoiceId}")
    public ResponseEntity<?> createPayment(
            @PathVariable Long invoiceId,
            HttpServletRequest request) {
        try {
            InvoiceDetailResponse invoice = invoiceService.getInvoice(invoiceId);
            String ipAddr = getClientIp(request);
            String paymentUrl = vnPayService.createPaymentUrl(
                    invoiceId, invoice.getFinalAmount(), ipAddr);
            return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage()));
        }
    }

    /**
     * VNPay callback — backend xác thực chữ ký, cập nhật trạng thái hóa đơn,
     * sau đó redirect trình duyệt sang trang kết quả ở frontend.
     */
    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request,
                            HttpServletResponse response) throws IOException {
        // Thu thập toàn bộ params
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });

        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String responseCode = params.getOrDefault("vnp_ResponseCode", "99");
        String txnRef       = params.getOrDefault("vnp_TxnRef", "");

        boolean hashValid = vnPayService.verifyHash(params, secureHash);

        if (hashValid && "00".equals(responseCode)) {
            try {
                // txnRef = "{invoiceId}_{timestamp}"
                Long invoiceId = Long.parseLong(txnRef.split("_")[0]);
                invoiceService.markAsPaid(invoiceId, txnRef);
                response.sendRedirect(
                        frontendResultUrl + "?success=true&invoiceId=" + invoiceId);
            } catch (Exception e) {
                response.sendRedirect(
                        frontendResultUrl + "?success=false&message=Loi+cap+nhat");
            }
        } else {
            // responseCode 24 = người dùng huỷ, 07 = nghi ngờ gian lận, v.v.
            response.sendRedirect(
                    frontendResultUrl + "?success=false&code=" + responseCode);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Nếu nhiều IP (proxy chain), lấy IP đầu tiên
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return (ip == null || ip.isEmpty()) ? "127.0.0.1" : ip;
    }
}
