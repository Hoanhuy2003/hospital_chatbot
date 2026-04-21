package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "qualification", length = 200)//trinh do
    private String qualification;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;// nam kinh nghiem

    @Column(name = "biography", columnDefinition = "TEXT")
    private String biography;

    @Column(name = "rating")
    private Double rating ; // cấp bậc

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;// đánh giá

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;

    @Column(name = "price")
    private Double price;

    @Column(name = "supports_online")
    private Boolean supportsOnline = true; // hỗ trọe trực tuyến

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(name = "photo_thumbnail_url", length = 255)
    private String photoThumbnailUrl;

    @Column(name = "is_verified")
    private Boolean isVerified = false; // xác minh
}
