package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("appointment_id")
    private Long appointmentId;

    @JsonProperty("amount")
    private BigDecimal amount;

    @JsonProperty("payment_method")
    private String paymentMethod; // Lưu tên Enum: VNPAY, MOMO...

    @JsonProperty("status")
    private String status; // Lưu tên Enum: PENDING, PAID...

    @JsonProperty("transaction_id")
    private String transactionId;

    @JsonProperty("paid_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidAt;

    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
