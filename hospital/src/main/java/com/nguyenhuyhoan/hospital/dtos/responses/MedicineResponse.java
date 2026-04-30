package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicineResponse {

    private Long id;
    private String name;
    private String unit;
    private String dosageInstruction;
    private Double price;
    private Long specialtyId; // Chỉ trả về ID để Frontend dễ quản lý
    private String specialtyName;


}
