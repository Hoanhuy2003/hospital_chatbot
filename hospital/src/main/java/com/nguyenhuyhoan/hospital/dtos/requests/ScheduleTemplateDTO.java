package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleTemplateDTO {
    @NotNull(message = "Doctor ID không được để trống")
    @JsonProperty("doctor_id")
    private Long doctorId;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    @JsonFormat(pattern = "HH:mm")
    @JsonProperty("start_time")
    private LocalTime startTime; // Ví dụ: "08:00"

    @NotNull(message = "Giờ kết thúc không được để trống")
    @JsonFormat(pattern = "HH:mm")
    @JsonProperty("end_time")
    private LocalTime endTime;   // Ví dụ: "10:00"

    @Min(value = 1, message = "Thời lượng ca khám ít nhất phải 1 phút")
    @JsonProperty("duration_minutes")
    private int durationMinutes; // Ví dụ: 30

    @Min(value = 1, message = "Số bệnh nhân tối đa ít nhất phải là 1")
    @JsonProperty("max_patients")
    private int maxPatients;     // Ví dụ: 1

    @JsonProperty("is_active")
    private boolean isActive = true;
}
