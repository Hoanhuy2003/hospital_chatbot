package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleDTO {

    @JsonProperty("doctor_id")
    private Long doctorId;

    @JsonProperty("clinic_id")
    private Long clinicId;

    @JsonProperty("date")
    private LocalDate date;

    private List<String> timeSlots;

    private Integer maxPatients;

}
