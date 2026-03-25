package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorSimpleResponse {

    private Long id;
    private String fullName;
    private String qualification;
}
