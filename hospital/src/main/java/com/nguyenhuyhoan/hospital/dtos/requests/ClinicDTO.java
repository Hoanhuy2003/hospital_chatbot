package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("address")
    private String address;

    @JsonProperty("phone")
    private String phone;

    // Thông tin Chuyên khoa
    @JsonProperty("specialty_id")
    private Long specialtyId;

    @JsonProperty("specialty_name")
    private String specialtyName;

    // Thông tin Bác sĩ phụ trách
    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("doctor_name")
    private String doctorName;

    @JsonProperty("is_active")
    private Boolean isActive;
}
