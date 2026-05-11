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
public class InvoiceResponse {
    private Long id;
    private Long medicalRecordId;
    private String patientName;
    private String clinicName;
    private String diagnosis;

    private List<MedicineDTO> items;
    private Double totalAmount;
    private Double insuranceDiscount;
    private Double finalAmount;
    private String status;
    private LocalDateTime createAt;
}
