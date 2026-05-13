package com.nguyenhuyhoan.hospital.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicalRecordResponse {

    private Long id;

    @JsonProperty("patient_name")
    private String patientName;

    @JsonProperty("doctor_name")
    private String doctorName;

    @JsonProperty("appointment_id")
    private Long appointmentId;

    private String symptoms;    // Triệu chứng
    private String diagnosis;   // Chẩn đoán
    private String treatment;   // Hướng điều trị
    private String prescription; // Đơn thuốc (JSON String)

    private String photoUrl;

    @JsonProperty("follow_up_date")
    private LocalDate followUpDate;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Hàm static để chuyển đổi nhanh từ Entity sang Response
    public static MedicalRecordResponse fromMedicalRecord(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .patientName(record.getPatient().getFullName())
                .doctorName(record.getDoctor().getUser().getFullName())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .prescription(record.getPrescription())
                .photoUrl(record.getPhotoUrl())
                .followUpDate(record.getFollowUpDate())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
