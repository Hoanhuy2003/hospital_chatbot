package com.nguyenhuyhoan.hospital.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSelfProfileResponse {

    private UserResponse user;

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("specialty_name")
    private String specialtyName;

    @JsonProperty("clinic_name")
    private String clinicName;

    private Double price;
    private String qualification;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    private String biography;

    @JsonProperty("photo_url")
    private String photoUrl;

    @JsonProperty("supports_online")
    private Boolean supportsOnline;

    @JsonProperty("is_verified")
    private Boolean isVerified;
}
