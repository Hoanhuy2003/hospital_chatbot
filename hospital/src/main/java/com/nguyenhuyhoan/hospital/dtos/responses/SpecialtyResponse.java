package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpecialtyResponse {
    private Long id;

    private String name;

    private String description;

    private String iconUrl;
}
