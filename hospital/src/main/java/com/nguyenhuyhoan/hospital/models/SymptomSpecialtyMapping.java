package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "symptom_specialty_mapping")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SymptomSpecialtyMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symptom_name", nullable = false, length = 100)
    private String symptomName;

    @ManyToOne
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "confidence_level")
    private BigDecimal confidenceLevel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_common")
    private Boolean isCommon = false;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createAt;
}

