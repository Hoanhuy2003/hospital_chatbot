package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotlineResponse {

    private String departmentName;
    private String phoneNumber;
    private String description;
}
