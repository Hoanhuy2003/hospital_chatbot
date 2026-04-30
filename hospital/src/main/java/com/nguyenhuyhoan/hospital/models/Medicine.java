package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicines")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "name", nullable = false)
    private String name; // Tên thuốc

    @Column(name = "unit")
    private String unit; // Đơn vị tính (Viên, Lọ, Gói)

    @Column(name = "dosage_instruction")
    private String dosageInstruction; // Hướng dẫn mặc định

    @Column(name = "price")
    private Double price; // Giá thuốc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty; // Thuộc chuyên khoa nào

    @Column(name = "is_active")
    private Boolean isActive = true;
}
