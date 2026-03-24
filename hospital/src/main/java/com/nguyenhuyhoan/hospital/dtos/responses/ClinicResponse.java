package com.nguyenhuyhoan.hospital.dtos.responses;


import com.nguyenhuyhoan.hospital.models.Clinic;
import lombok.*;

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
    private String doctorName;
    private Boolean isActive;


    public  static ClinicResponse fromClinic(Clinic clinic){
        return ClinicResponse.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .phone(clinic.getPhone())
                .specialtyName(clinic.getSpecialty().getName())
                .doctorName(clinic.getDoctor().getUser().getFullName())
                .isActive(clinic.getIsActive())
                .build();
    }
}
