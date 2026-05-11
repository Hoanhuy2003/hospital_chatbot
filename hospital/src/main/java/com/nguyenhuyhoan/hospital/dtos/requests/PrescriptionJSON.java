package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PrescriptionJSON {
    @JsonProperty("medicine_id") // Rất quan trọng: Phải khớp 100% với key trong JSON ở DB
    private Long medicineId;

    @JsonProperty("name") // Thêm trường này vì trong DB Hoàn đang có trường name
    private String name;

    @JsonProperty("quantity")
    private Integer quantity;

    @JsonProperty("note")
    private String note;
}

