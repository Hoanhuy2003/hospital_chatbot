package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "medical_record_id")
    private MedicalRecord medicalRecord;

    private Double examinationFee;     // Tiền khám
    private Double totalMedicineCost;  // Tổng tiền thuốc

    private Boolean hasInsurance;      // Có dùng BHYT không
    private Double insuranceDiscount;  // Số tiền được giảm

    private Double totalAmount;        // Tổng gốc (Tiền khám + Thuốc)
    private Double finalAmount;        // Số tiền thực trả sau giảm trừ

    private String status;             // PENDING, PAID, CANCELLED
    private LocalDateTime createdAt;
}
