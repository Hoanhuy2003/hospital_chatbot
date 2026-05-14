package com.nguyenhuyhoan.hospital.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nguyenhuyhoan.hospital.models.User;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    private Long id;

    @JsonProperty("fullName")
    private String fullName;

    private String phone;

    private String email;

    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    @JsonProperty("role_name")
    private String roleName;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    @JsonProperty("is_active")
    private Boolean isActive;

    // ── Bảo hiểm y tế ──
    @JsonProperty("health_insurance_number")
    private String healthInsuranceNumber;

    @JsonProperty("insurance_expiry_date")
    private LocalDate insuranceExpiryDate;

    @JsonProperty("insurance_benefit_level")
    private Integer insuranceBenefitLevel;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .address(user.getAddress())
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .healthInsuranceNumber(user.getHealthInsuranceNumber())
                .insuranceExpiryDate(user.getInsuranceExpiryDate())
                .insuranceBenefitLevel(user.getInsuranceBenefitLevel())
                .build();
    }
}
