package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ClinicResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IClinicService;
import com.nguyenhuyhoan.hospital.models.Clinic;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.Specialty;
import com.nguyenhuyhoan.hospital.repositoris.ClinicRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClinicService implements IClinicService {

    private final ClinicRepository clinicRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;


    @Override
    @Transactional
    public ClinicResponse createClinic(ClinicDTO clinicDTO) throws DataNotFoundException {

        Specialty specialty = specialtyRepository.findById(clinicDTO.getSpecialtyId())
                .orElseThrow(()-> new DataNotFoundException("Không tồn tại chuyên khoa này"));

//        Doctor doctor = null;
//        if (clinicDTO.getDoctorId() != null) {
//            doctor = doctorRepository.findById(clinicDTO.getDoctorId())
//                    .orElseThrow(() -> new DataNotFoundException("Không tìm thấy bác sĩ"));
//        }
        Clinic clinic = Clinic.builder()
                .name(clinicDTO.getName())
                .phone(clinicDTO.getPhone())
                .address(clinicDTO.getAddress())
                .specialty(specialty)
                .isActive(clinicDTO.getIsActive())
                .build();
        return ClinicResponse.fromClinic(clinicRepository.save(clinic));
    }

    @Override
    public Page<ClinicResponse> getAllClinics(Pageable pageable) {
        return clinicRepository.findAll(pageable).map(ClinicResponse::fromClinic);
    }

    @Override
    public ClinicResponse getClinicById(Long id) throws DataNotFoundException {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));
        return ClinicResponse.fromClinic(clinic);
    }

    @Override
    public ClinicResponse updateClinic(Long id, ClinicDTO clinicDTO) throws DataNotFoundException {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));

        if(clinicDTO.getName() != null) clinic.setName(clinic.getName());
        if(clinicDTO.getPhone()!= null) clinic.setPhone(clinic.getPhone());
        if(clinicDTO.getAddress()!= null) clinic.setAddress(clinic.getAddress());

        if(clinicDTO.getSpecialtyId() != null){
            Specialty specialty = specialtyRepository.findById(id)
                    .orElseThrow(()-> new DataNotFoundException("Chuyên khoa không tồn tại"));
            clinic.setSpecialty(specialty);
        }

//        if(clinicDTO.getDoctorId() != null){
//            Doctor doctor = doctorRepository.findById(id)
//                    .orElseThrow(()-> new DataNotFoundException("Không có bác sỹ này trong phòng khám"));
//            clinic.setDoctor(doctor);
//        }
         return ClinicResponse.fromClinic(clinicRepository.save(clinic));
    }

    @Override
    @Transactional
    public void deleteClinic(Long id) throws DataNotFoundException {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));
        clinic.setIsActive(false);
        clinicRepository.save(clinic);


    }


}
