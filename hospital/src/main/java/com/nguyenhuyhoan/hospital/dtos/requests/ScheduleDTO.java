package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleDTO {

    @NotNull(message = "doctor_id không được để trống")
    @JsonProperty("doctor_id")
    private Long doctorId;

    @NotNull(message = "clinic_id không được để trống")
    @JsonProperty("clinic_id")
    private Long clinicId;

    @NotNull(message = "date không được để trống")
    @JsonProperty("date")
    private LocalDate date;

    @NotEmpty(message = "Phải chọn ít nhất 1 khung giờ")
    private List<String> timeSlots;

    @NotNull(message = "maxPatients không được để trống")
    private Integer maxPatients;

}
