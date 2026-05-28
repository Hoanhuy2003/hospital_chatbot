package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.multipart.MultipartFile;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDTO {

    @JsonProperty("id")
    private Long id;


    @JsonProperty("user_id")
    private Long userId;

    // Thông tin chuyên môn
    @JsonProperty("specialty_id")
    private Long specialtyId;


    @JsonProperty("qualification")
    private String qualification;

    @JsonProperty("experience_years")
    private Integer experienceYears;

    @JsonProperty("biography")
    private String biography;

    @JsonProperty("practice_license_number")
    private String practiceLicenseNumber;

    private MultipartFile practiceLicenseUrl;

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

    @JsonProperty("clinic_id")
    private Long clinicId;

    @JsonProperty("price")
    private Double price;

    // Media & Hỗ trợ
    @JsonProperty("supports_online")
    private Boolean supportsOnline;


    private MultipartFile photoUrl;

    @JsonProperty("photo_thumbnail_url")
    private String photoThumbnailUrl;
}
