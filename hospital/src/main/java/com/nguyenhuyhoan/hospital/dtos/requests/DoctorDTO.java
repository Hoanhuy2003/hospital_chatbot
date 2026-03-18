package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDTO {

    @JsonProperty("id")
    private Long id;

    // Lấy thông tin từ Entity User
    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("phone")
    private String phone;

    // Thông tin chuyên môn
    @JsonProperty("specialty_id")
    private Long specialtyId;

    @JsonProperty("specialty_name")
    private String specialtyName;

    @JsonProperty("qualification")
    private String qualification;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    @JsonProperty("biography")
    private String biography;

    // Đánh giá và xác minh
    @JsonProperty("rating")
    private Double rating;

    @JsonProperty("total_reviews")
    private Integer totalReviews;

    @JsonProperty("is_verified")
    private Boolean isVerified;

    // Địa điểm làm việc
    @JsonProperty("hospital_id")
    private Long hospitalId;

    @JsonProperty("hospital_name")
    private String hospitalName;

    @JsonProperty("clinic_id")
    private Long clinicId;

    @JsonProperty("clinic_name")
    private String clinicName;

    // Media & Hỗ trợ
    @JsonProperty("supports_online")
    private Boolean supportsOnline;

    @JsonProperty("photo_url")
    private String photoUrl;

    @JsonProperty("photo_thumbnail_url")
    private String photoThumbnailUrl;
}
