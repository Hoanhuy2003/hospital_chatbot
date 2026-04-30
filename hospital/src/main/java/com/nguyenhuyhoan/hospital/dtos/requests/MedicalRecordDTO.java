package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecordDTO {



    @JsonProperty("name")
    private String name;

    @JsonProperty("patient_id")
    private Long patientId;

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("appointment_id")
    private Long appointmentId;

    @JsonProperty("symptoms")
    private String symptoms;

    @JsonProperty("diagnosis")
    private String diagnosis;

    @JsonProperty("treatment")
    private String treatment;

    @JsonProperty("prescription")
    private String prescription; // Nhận/Xuất chuỗi JSON đơn thuốc

    @JsonProperty("attachments")
    private String attachments; // Nhận/Xuất chuỗi JSON các link file đính kèm


    @JsonProperty("photo_url")
    private String photoUrl;


    @JsonProperty("follow_up_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate followUpDate;

    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}
