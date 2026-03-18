package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;// benh nhan

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;// bac sĩ

    @ManyToOne
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    @ManyToOne
    @JoinColumn(name = "clinic_id")
    private Clinic clinic;// khoa

    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime;// thơi gian khám

    @Column(name = "queue_number", unique = true, length = 20)
    private String queueNumber;// số chờ

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private Type type = Type.IN_PERSON;

    @Column(name = "voucher_code", unique = true, length = 50)
    private String voucherCode;

    @Column(name = "video_call_link", length = 255)
    private String videoCallLink;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;// ly do

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status { PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW }
    public enum Type { IN_PERSON, ONLINE_CHAT, ONLINE_VIDEO }
}
