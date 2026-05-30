package com.nguyenhuyhoan.hospital.dtos.responses;

import com.nguyenhuyhoan.hospital.models.Appointment;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentResponse {

    private Long id;
    /** Tên ghi trên phiếu đặt lịch (có thể khác họ tên tài khoản). */
    private String patientName;
    /** Thông tin tài khoản bệnh nhân (User). */
    private Long patientId;
    private String patientFullName;
    private String patientPhone;
    private String patientEmail;
    private LocalDate patientDateOfBirth;
    private String patientGender;
    private String patientAddress;
    private String patientHealthInsuranceNumber;
    private LocalDate patientInsuranceExpiryDate;
    private Integer patientInsuranceBenefitLevel;
    private String patientAvatarUrl;

    private String doctorName;
    private String clinicName;
    private Long specialtyId;
    private String specialtyName;
    private String photoUrl;

    private String date;
    private String timeSlot;

    private String queueNumber;
    private String status;
    private String type;
    private String reason;

    /** Lý do hủy khi trạng thái CANCELLED (đặt bởi bác sĩ / admin). */
    private String cancellationReason;

    private String videoCallLink;

    private LocalDateTime createdAt;

    public static AppointmentResponse fromAppointment(Appointment appointment){
        var patient = appointment.getPatient();
        return  AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(appointment.getName())
                .patientId(patient != null ? patient.getId() : null)
                .patientFullName(patient != null ? patient.getFullName() : null)
                .patientPhone(patient != null ? patient.getPhone() : null)
                .patientEmail(patient != null ? patient.getEmail() : null)
                .patientDateOfBirth(patient != null ? patient.getDateOfBirth() : null)
                .patientGender(patient != null && patient.getGender() != null
                        ? patient.getGender().name() : null)
                .patientAddress(patient != null ? patient.getAddress() : null)
                .patientHealthInsuranceNumber(patient != null ? patient.getHealthInsuranceNumber() : null)
                .patientInsuranceExpiryDate(patient != null ? patient.getInsuranceExpiryDate() : null)
                .patientInsuranceBenefitLevel(patient != null ? patient.getInsuranceBenefitLevel() : null)
                .patientAvatarUrl(patient != null ? patient.getAvatarUrl() : null)
                .doctorName(appointment.getSchedule().getDoctor().getUser().getFullName())
                .clinicName(appointment.getSchedule().getClinic().getName())
                .specialtyId(appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null
                        ? appointment.getDoctor().getSpecialty().getId() : null)
                .specialtyName(appointment.getDoctor() != null && appointment.getDoctor().getSpecialty() != null
                        ? appointment.getDoctor().getSpecialty().getName()
                        : (appointment.getSchedule().getClinic().getSpecialty() != null
                        ? appointment.getSchedule().getClinic().getSpecialty().getName() : null))
                .photoUrl(appointment.getDoctor().getPhotoUrl())
                .date(appointment.getSchedule().getDate().toString())
                .timeSlot(appointment.getSchedule().getTimeSlot())

                .queueNumber(appointment.getQueueNumber())
                .status(appointment.getStatus().toString())
                .type(appointment.getType().toString())
                .reason(appointment.getReason())
                .cancellationReason(appointment.getCancellationReason())
                .videoCallLink(appointment.getVideoCallLink())
                .createdAt(appointment.getCreatedAt())

                .build();
    }
}
