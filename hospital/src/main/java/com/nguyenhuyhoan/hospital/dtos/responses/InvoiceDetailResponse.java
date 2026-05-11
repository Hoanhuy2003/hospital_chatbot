package com.nguyenhuyhoan.hospital.dtos.responses;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicineDTO;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDetailResponse {
    private Long invoiceID;
    private String patientName;
    private String healthInsuranceNumber;
    private String doctorName;
    private String diagnosis;
    private LocalDateTime createAt;

    private List<MedicineLineItem> items;

    private Double examinationFee;    // Tiền khám
    private Double totalMedicineCost; // Tổng tiền thuốc
    private Double insuranceDiscount; // Số tiền BHYT giảm
    private Double finalAmount;       // Thực trả
    private String status;

    @Data
    @Builder
    public static class MedicineLineItem {
        private MedicineDTO medicine; // Chứa Name, Unit, Price...
        private Integer quantity;
        private Double subTotal;
    }
}
