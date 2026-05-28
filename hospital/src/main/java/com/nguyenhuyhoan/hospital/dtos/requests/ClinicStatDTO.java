package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClinicStatDTO {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private Long specialtyId;
    private String specialtyName;
    private String description;
    private Boolean isActive;
    private Long doctorCount;
}
