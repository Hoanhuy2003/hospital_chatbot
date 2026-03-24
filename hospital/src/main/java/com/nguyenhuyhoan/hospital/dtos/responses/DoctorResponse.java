package com.nguyenhuyhoan.hospital.dtos.responses;

import com.nguyenhuyhoan.hospital.models.Doctor;
import lombok.*;

import javax.print.Doc;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DoctorResponse {

    private Long id;
    private String fullName;
    private String specialtyName;
    private String clinicName;
    private String qualification;
    private Integer experienceYears;
    private Double rating;
    private String photoUrl;
    private Boolean isVerified;
    private String biography;




}
