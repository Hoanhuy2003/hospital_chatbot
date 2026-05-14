package com.nguyenhuyhoan.hospital.dtos.auth;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String role;
    private Long userId;
    private String fullName;
    private String message;
    private String address;

    // Chỉ có giá trị khi role = DOCTOR
    private Long doctorId;
    private Long clinicId;
}
