package com.nguyenhuyhoan.hospital.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FollowUpResponse {

    @JsonProperty("medical_record_id")
    private Long medicalRecordId;

    @JsonProperty("patient_id")
    private Long patientId;

    @JsonProperty("patient_name")
    private String patientName;

    @JsonProperty("patient_phone")
    private String patientPhone;

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("doctor_user_id")
    private Long doctorUserId;

    @JsonProperty("doctor_name")
    private String doctorName;

    @JsonProperty("specialty_id")
    private Long specialtyId;

    @JsonProperty("specialty_name")
    private String specialtyName;

    @JsonProperty("clinic_id")
    private Long clinicId;

    @JsonProperty("clinic_name")
    private String clinicName;

    @JsonProperty("previous_appointment_id")
    private Long previousAppointmentId;

    @JsonProperty("follow_up_date")
    private LocalDate followUpDate;

    @JsonProperty("days_until")
    private Long daysUntil;

    private String diagnosis;

    /** Tương thích frontend cũ (next-appointments). */
    @JsonProperty("date")
    private String date;

    @JsonProperty("name")
    private String name;

    @JsonProperty("note")
    private String note;

    @JsonProperty("phone")
    private String phone;
}
