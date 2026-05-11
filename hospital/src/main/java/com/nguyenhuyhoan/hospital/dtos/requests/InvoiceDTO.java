package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {
    private Long medicalRecordId;
    private Boolean useInsurance;// bhyt

}
