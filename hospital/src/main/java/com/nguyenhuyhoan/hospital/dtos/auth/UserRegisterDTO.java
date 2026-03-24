package com.nguyenhuyhoan.hospital.dtos.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterDTO {

    @JsonProperty("full_name")
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;

    @JsonProperty("phone")
    @NotBlank
    @Size(min = 10, max = 12)
    private String phone;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("date_of_birth")
    private LocalDate dateOfBirth;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("address")
    private String address;

    @JsonProperty("role_id")
    private String roleId;

    @JsonProperty("password")
    @NotBlank
    @Size(min = 6, max = 50)
    private String password;


    @JsonProperty("retype_password")
    @NotBlank
    @Size(min = 6, max = 50)
    private String retypePassword;




}
