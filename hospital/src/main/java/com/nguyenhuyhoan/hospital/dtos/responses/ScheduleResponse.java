package com.nguyenhuyhoan.hospital.dtos.responses;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.nguyenhuyhoan.hospital.models.Schedule;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleResponse {
    private Long id;
    private String doctorName;
    private String clinicName;
    private String specialtyName;
    private LocalDate date;
    private String timeSlot;
    private Integer maxPatients;
    private Integer currentPatients;
    private Integer availableSlots; // Số chỗ còn trống
    private String status; // "Còn chỗ", "Hết chỗ", "Ngừng nhận"

    public static ScheduleResponse fromSchedule(Schedule schedule){
        int available = schedule.getMaxPatients() - schedule.getCurrentPatients();
        String statusText = "AVAILABLE";// còn chỗ

        if(!schedule.getIsActive()) statusText = "LOCKED";// ngừng nhaan
        else if(available <= 0) statusText = "FULL";// hết chỗ

        return ScheduleResponse.builder()
                .id(schedule.getId())
                .doctorName(schedule.getDoctor().getUser().getFullName())
                .clinicName(schedule.getClinic().getName())
                .specialtyName(schedule.getClinic().getSpecialty().getName())
                .date(schedule.getDate())
                .timeSlot(schedule.getTimeSlot())
                .maxPatients(schedule.getMaxPatients())
                .currentPatients(schedule.getCurrentPatients())
                .availableSlots(available < 0 ? 0 : available)
                .status(statusText)
                .build();
    }
}
