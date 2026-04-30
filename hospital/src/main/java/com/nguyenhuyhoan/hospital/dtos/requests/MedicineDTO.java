package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MedicineDTO {

    @JsonProperty("name")
    private String name;

    @JsonProperty("unit")
    private String unit;


    @JsonProperty("dosage_instruction")
    private String dosageInstruction;

    @JsonProperty("price")
    private Double price;

    @JsonProperty("specialty_id")
    private Long specialtyId;
}
