package com.nguyenhuyhoan.hospital.dtos.responses;


import com.nguyenhuyhoan.hospital.models.Clinic;
import com.nguyenhuyhoan.hospital.models.Doctor;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClinicResponse {
    private Long id;
    private String name;
    private String phone;
    private String specialtyName;
    private String address;
    private String photoUrl;
    //private String doctorName;
    private Boolean isActive;

    private List<DoctorSimpleResponse> doctors;


    public  static ClinicResponse fromClinic(Clinic clinic){
        return ClinicResponse.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .phone(clinic.getPhone())
                .specialtyName(clinic.getSpecialty().getName())
                .address(clinic.getAddress())
                .photoUrl(clinic.getPhotoUrl())
     //           .doctorName(clinic.getDoctor().getUser().getFullName())
                .isActive(clinic.getIsActive())
                .doctors(clinic.getDoctors() != null ?
                                clinic.getDoctors().stream()
                                        .map(doc -> DoctorSimpleResponse.builder()
                                                .id(doc.getId())
                                                .fullName(doc.getUser().getFullName())
                                                .qualification(doc.getQualification())
                                                .build())
                                        .collect(Collectors.toList()) : new ArrayList<>()

                        )
                .build();
    }


}
