package com.nguyenhuyhoan.hospital.dtos.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginDTO {


    @JsonProperty("phone")
    @NotBlank(message = "Bắt buộc phải nhập số điện thoai")
    @Size(min = 10, max = 12)
    private String phone;

    @JsonProperty("password")
    @NotBlank(message = "Bắt buộc")
    @Size(min = 6)
    private String password;
}
