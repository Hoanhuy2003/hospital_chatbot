package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleTemplateResponse {
    private Long id;
    private Long doctorId;
    private String startTime;
    private String endTime;
    private int durationMinutes;
    private List<String> morningSlots;   // Danh sách: ["08:00", "08:30"...]
    private List<String> afternoonSlots; // Danh sách: ["13:30", "14:00"...]
}
