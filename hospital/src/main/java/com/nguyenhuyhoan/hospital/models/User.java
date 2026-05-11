package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column( name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column( name = "phone", nullable = false, unique = true, length = 12)
    private String phone;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;



    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "health_insurance_number", length = 15)
    private String healthInsuranceNumber;

    @Column(name = "insurance_expiry_date")
    private LocalDate insuranceExpiryDate; // Nên dùng LocalDate để dễ so sánh ngày hết hạn

    @Column(name = "insurance_benefit_level")
    private Integer insuranceBenefitLevel; // Lưu mức hưởng (ví dụ: 80, 95, 100)

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "health_profile_json", columnDefinition = "JSON")
    private String healthProfileJson;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    public enum Gender {
        MALE, FEMALE, OTHER
    }



}
