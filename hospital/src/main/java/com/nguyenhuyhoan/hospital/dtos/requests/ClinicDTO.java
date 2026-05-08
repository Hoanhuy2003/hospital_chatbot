package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicDTO {

    @NotBlank
    @JsonProperty("name")
    private String name;

    @NotBlank
    @JsonProperty("address")
    private String address;

    @JsonProperty("phone")
    private String phone;

    // Thông tin Chuyên khoa
    @JsonProperty("specialty_id")
    private Long specialtyId;


    // Thông tin Bác sĩ phụ trách

   // private Long doctorId;

    private MultipartFile photoUrl;


    @JsonProperty("is_active")
    private Boolean isActive;
}
