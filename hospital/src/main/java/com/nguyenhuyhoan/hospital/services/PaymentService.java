package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.configurations.VNPayConfig;
import com.nguyenhuyhoan.hospital.dtos.requests.PaymentDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.PaymentResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import com.nguyenhuyhoan.hospital.iservices.IPaymentService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.Notification;
import com.nguyenhuyhoan.hospital.models.Payment;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final INotificationService notificationService;


    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentDTO dto) throws Exception {

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(()-> new DataNotFoundException("Khong tìm thấy cuộc hẹn"));

        Payment payment = Payment.builder()
                .name("Thanh toán hóa đơn: "+ appointment.getPatient().getFullName())
                .appointment(appointment)
                .amount(dto.getAmount())
                .paymentMethod(Payment.Method.valueOf(dto.getPaymentMethod()))
                .status(Payment.Status.PENDING)
                .build();

        return PaymentResponse.fromPayment(paymentRepository.save(payment));
    }

    @Override
    @Transactional
    public PaymentResponse processPaymentSuccess(String transactionId, String method) throws Exception {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(()-> new DataNotFoundException("Giao dịch này không tồn tại"));
        payment.setStatus(Payment.Status.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // gui thoong báo cho bênh nhân
        notificationService.sendNotification(
                payment.getAppointment().getPatient().getId(),
                "Thanh toán thành công",
                "Hóa đơn giá trị: " + payment.getAmount() +"VND đã được thanh toán qua "+ method,
                Notification.Type.RESULT_READY
        );



        return PaymentResponse.fromPayment(payment);
    }

    @Override
    public PaymentResponse getPaymentDetail(Long appointmentId) throws Exception {

        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(()-> new DataNotFoundException("Chưa thanh toán"));
        return PaymentResponse.fromPayment(payment);
    }

    @Override
    public String createVNPayPayment(Long paymentId, HttpServletRequest request) throws UnsupportedEncodingException {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = String.valueOf(payment.getId()); // Dùng ID Payment làm mã tham chiếu
        String vnp_IpAddr = "127.0.0.1";
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(payment.getAmount().multiply(new BigDecimal(100)).intValue())); // VNPay tính theo đơn vị VND * 100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan hoa don: " + payment.getId());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Sắp xếp tham số và tạo chuỗi hash
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return VNPayConfig.vnp_PayUrl + "?" + queryUrl;
    }

    @Override
    @Transactional
    public void updatePaymentStatus(Long paymentId, Payment.Status status, String transactionId) throws Exception {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        if (status == Payment.Status.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);

    }
}
