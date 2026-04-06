package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hospital_hotlines")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HospitalHotline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_name", nullable = false)
    private String departmentName; // Ví dụ: "Tổng đài chung", "Cấp cứu 24/7"

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;





}
