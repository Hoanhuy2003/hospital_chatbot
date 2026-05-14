package com.nguyenhuyhoan.hospital.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.payment-url}")
    private String paymentUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    /**
     * Tạo URL thanh toán VNPay.
     *
     * @param invoiceId ID hóa đơn
     * @param amount    Số tiền thực trả (VND)
     * @param ipAddr    IP người dùng
     */
    public String createPaymentUrl(Long invoiceId, double amount, String ipAddr) throws Exception {
        // VNPay nhận amount * 100
        long vnpAmount = Math.round(amount * 100);

        // TxnRef = invoiceId_timestamp — duy nhất cho mỗi giao dịch
        String txnRef = invoiceId + "_" + System.currentTimeMillis();
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        // Dùng TreeMap để tự động sort theo key (VNPay yêu cầu)
        TreeMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version",    "2.1.0");
        params.put("vnp_Command",    "pay");
        params.put("vnp_TmnCode",    tmnCode);
        params.put("vnp_Amount",     String.valueOf(vnpAmount));
        params.put("vnp_CurrCode",   "VND");
        params.put("vnp_TxnRef",     txnRef);
        params.put("vnp_OrderInfo",  "Thanh toan hoa don " + invoiceId);
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     "vn");
        params.put("vnp_ReturnUrl",  returnUrl);
        params.put("vnp_IpAddr",     ipAddr);
        params.put("vnp_CreateDate", createDate);

        // Xây dựng chuỗi hash và query string
        StringBuilder hashData  = new StringBuilder();
        StringBuilder queryData = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String encodedKey   = URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII);
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);

            hashData.append(encodedKey).append('=').append(encodedValue).append('&');
            queryData.append(encodedKey).append('=').append(encodedValue).append('&');
        }
        // Bỏ '&' cuối
        hashData.deleteCharAt(hashData.length() - 1);
        queryData.deleteCharAt(queryData.length() - 1);

        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        queryData.append("&vnp_SecureHash=").append(secureHash);

        return paymentUrl + "?" + queryData;
    }

    /**
     * Xác thực chữ ký VNPay callback.
     *
     * @param params     Toàn bộ query params từ VNPay (KHÔNG bao gồm vnp_SecureHash)
     * @param secureHash Giá trị vnp_SecureHash VNPay gửi về
     */
    public boolean verifyHash(Map<String, String> params, String secureHash) {
        // Sort params và build lại hash string
        TreeMap<String, String> sorted = new TreeMap<>(params);
        StringBuilder hashData = new StringBuilder();

        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            String encodedKey   = URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII);
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);
            hashData.append(encodedKey).append('=').append(encodedValue).append('&');
        }
        hashData.deleteCharAt(hashData.length() - 1);

        try {
            String computed = hmacSHA512(hashSecret, hashData.toString());
            return computed.equalsIgnoreCase(secureHash);
        } catch (Exception e) {
            return false;
        }
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(
                key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        mac.init(secretKey);
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
