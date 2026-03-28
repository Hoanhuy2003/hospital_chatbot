package com.nguyenhuyhoan.hospital.dtos.responses;

import com.nguyenhuyhoan.hospital.models.Appointment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentResponse {

    private Long id;
    private String patientName;
    private String doctorName;
    private String clinicName;
    private String specialtyName;

    private String date;
    private String timeSlot;

    private String queueNumber;
    private String status;
    private String type;
    private String reason;

    private String videoCallLink;

    private LocalDateTime createdAt;

    public static AppointmentResponse fromAppointment(Appointment appointment){
        return  AppointmentResponse.builder()
                .id(appointment.getId())
                .patientName(appointment.getName())
                .doctorName(appointment.getSchedule().getDoctor().getUser().getFullName())
                .clinicName(appointment.getSchedule().getClinic().getName())
                .specialtyName(appointment.getSchedule().getClinic().getSpecialty().getName())
                .date(appointment.getSchedule().getDate().toString())
                .timeSlot(appointment.getSchedule().getTimeSlot())

                .queueNumber(appointment.getQueueNumber())
                .status(appointment.getStatus().toString())
                .type(appointment.getType().toString())
                .reason(appointment.getReason())
                .videoCallLink(appointment.getVideoCallLink())
                .createdAt(appointment.getCreatedAt())

                .build();
    }
}
