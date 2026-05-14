package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserDTO {

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("email")
    private String email;

    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    @JsonProperty("address")
    private String address;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    // ── Bảo hiểm y tế ──
    @JsonProperty("health_insurance_number")
    private String healthInsuranceNumber;

    @JsonProperty("insurance_expiry_date")
    private LocalDate insuranceExpiryDate;

    @JsonProperty("insurance_benefit_level")
    private Integer insuranceBenefitLevel;
}
