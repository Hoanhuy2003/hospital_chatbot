package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecord { // ho so benh an
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 150)
    private String name;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;// benh nhan

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;// triệu chứng

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;// chuẩn đoán

    @Column(name = "treatment", columnDefinition = "TEXT")
    private String treatment;// điều trị

    @Column(name = "prescription", columnDefinition = "JSON")
    private String prescription;// đơn thuốc

    @Column(name = "attachments", columnDefinition = "JSON")
    private String attachments;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
