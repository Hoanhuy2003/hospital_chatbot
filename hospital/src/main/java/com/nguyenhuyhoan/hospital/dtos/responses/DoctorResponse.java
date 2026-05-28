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
    private Double price;
    private String qualification;
    private Integer experienceYears;
    private String practiceLicenseNumber;
    private String practiceLicenseUrl;
    private Integer totalReviews;
    private Double rating;
    private String photoUrl;
    private Boolean isVerified;
    private String biography;




}
