package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorScheduleDTO {
    private Long doctorId;
    private LocalDate date;
    private List<String> availableTimeSlots; // Chỉ chứa List các chuỗi như "08:00_08:30"
}
