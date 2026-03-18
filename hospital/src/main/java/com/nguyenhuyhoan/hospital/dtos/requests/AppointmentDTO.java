package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("patient_id")
    private Long patientId;

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("hospital_id")
    private Long hospitalId;

    @JsonProperty("clinic_id")
    private Long clinicId;

    @JsonProperty("appointment_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime appointmentTime;

    @JsonProperty("queue_number")
    private String queueNumber;

    @JsonProperty("status")
    private String status; // Lưu tên Enum: PENDING, CONFIRMED...

    @JsonProperty("type")
    private String type; // Lưu tên Enum: IN_PERSON, ONLINE_VIDEO...

    @JsonProperty("voucher_code")
    private String voucherCode;

    @JsonProperty("video_call_link")
    private String videoCallLink;

    @JsonProperty("reason")
    private String reason;

    @JsonProperty("notes")
    private String notes;

    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
