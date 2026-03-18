package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SymptomMappingDTO {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("symptom_name")
    private String symptomName;

    @JsonProperty("specialty_id")
    private Long specialtyId;

    @JsonProperty("specialty_name")
    private String specialtyName; // Lấy từ Specialty.getName()

    @JsonProperty("confidence_level")
    private BigDecimal confidenceLevel;

    @JsonProperty("description")
    private String description;

    @JsonProperty("is_common")
    private Boolean isCommon;

    @JsonProperty("create_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createAt;

}
