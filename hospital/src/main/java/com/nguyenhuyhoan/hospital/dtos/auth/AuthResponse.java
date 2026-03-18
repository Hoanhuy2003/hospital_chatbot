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
}
