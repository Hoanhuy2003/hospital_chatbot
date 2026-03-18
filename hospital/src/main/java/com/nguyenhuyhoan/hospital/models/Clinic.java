package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clinics")// phong kham
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Clinic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;  // Phòng khám ABC, Phòng khám Nhi khoa XYZ...

    @Column(name = "address", columnDefinition = "TEXT", nullable = false)
    private String address;

    @Column(name = "phone", length = 20)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
