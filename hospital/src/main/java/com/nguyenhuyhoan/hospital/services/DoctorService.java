package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.DoctorDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.DoctorResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IDoctorService;
import com.nguyenhuyhoan.hospital.models.*;
import com.nguyenhuyhoan.hospital.repositoris.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService implements IDoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ClinicRepository clinicRepository;
    private final FileService fileService;
    private final CloudinaryService cloudinaryService;

//    @Value("${file.doctor-dir}")
//    private String subDir;


    @Override
    @Transactional
    public DoctorResponse createDoctor(DoctorDTO dto) throws IOException {
        String photoUrl = cloudinaryService.uploadDoctorImage(dto.getPhotoUrl());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(()-> new DataNotFoundException("User khoong tồn tại"));
        Role role = roleRepository.findByName("DOCTOR")
                .orElseThrow(()-> new DataNotFoundException("Role DOCTOR không tồn tại"));
        user.setRole(role);
        userRepository.save(user);

        Specialty specialty = specialtyRepository.findById(dto.getSpecialtyId())
                .orElseThrow(()-> new DataNotFoundException("Chuyên khoa không tồn tại"));

        Clinic clinic = clinicRepository.findById(dto.getClinicId())
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialty(specialty)
                .clinic(clinic)
                .qualification(dto.getQualification())
                .experienceYears(dto.getExperienceYears())
                .price(dto.getPrice())
                .biography(dto.getBiography())
                .photoUrl(photoUrl)
                .photoThumbnailUrl(null)
                .isVerified(dto.getIsVerified())
                .rating(dto.getRating())
                .totalReviews(0)
                .supportsOnline(true)
                .build();

        Doctor saveDoctor = doctorRepository.save(doctor);



        return mapToDoctor(saveDoctor);
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorDTO doctorDTO) throws IOException {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy bác sỹ"));

        if(doctorDTO.getSpecialtyId() != null){
            Specialty specialty = specialtyRepository.findById(doctorDTO.getSpecialtyId())
                    .orElseThrow(()-> new DataNotFoundException("Chuyên khoa không tồn tại"));
            doctor.setSpecialty(specialty);

        }

        if(doctorDTO.getClinicId() != null){
            Clinic clinic = clinicRepository.findById(doctorDTO.getClinicId())
                    .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));
            doctor.setClinic(clinic);
        }
        doctor.setPrice(doctorDTO.getPrice());

        doctor.setQualification(doctorDTO.getQualification());
        doctor.setBiography(doctorDTO.getBiography());
        doctor.setExperienceYears(doctorDTO.getExperienceYears());
        doctor.setRating(doctorDTO.getRating());
        doctor.setIsVerified(doctorDTO.getIsVerified());

       if(doctorDTO.getPhotoUrl() != null && !doctorDTO.getPhotoUrl().isEmpty()){
           String newPhotoUrl = cloudinaryService.uploadDoctorImage(doctorDTO.getPhotoUrl());
           doctor.setPhotoUrl(newPhotoUrl);
       }
        return mapToDoctor(doctorRepository.save(doctor));
    }

    @Override
    public void deleteDoctor(Long id) throws IOException {

    }

    @Override
    public DoctorResponse getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy bác sỹ"));

        return mapToDoctor(doctor);
    }

    @Override
    public Page<DoctorResponse> getAllDoctors(String keyword, Long specialtyId, Pageable pageable) {


        return doctorRepository.searchDoctors(keyword, specialtyId, pageable)
                .map(this::mapToDoctor);
    }

    @Override
    public void assignDoctorsToClinic(Long clinicId, List<Long> doctorIds) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám chưa tồn tại"));

        List<Doctor> newDoctors = doctorRepository.findAllById(doctorIds);
        if(newDoctors.isEmpty()) return;

        Long requiredSpecialtyId;
        String requiredSpecialtyName;

        List<Doctor> existingDoctors = doctorRepository.findByClinicId(clinicId);

        if(!existingDoctors.isEmpty()){
            requiredSpecialtyId = existingDoctors.get(0).getSpecialty().getId();
            requiredSpecialtyName = existingDoctors.get(0).getSpecialty().getName();

        } else {
            requiredSpecialtyId = newDoctors.get(0).getSpecialty().getId();
            requiredSpecialtyName = newDoctors.get(0).getSpecialty().getName();
        }

        for (Doctor doctor : newDoctors){
            if(!doctor.getSpecialty().getId().equals(requiredSpecialtyId)){
                throw new DataNotFoundException("Lỗi: Phòng khám chỉ nhận khoa "+ requiredSpecialtyName +
                        "Bác sĩ "+ doctor.getUser().getFullName() + "không cùng chuyeen khoa");
            }
        }
        newDoctors.forEach(d -> d.setClinic(clinic));
        doctorRepository.saveAll(newDoctors);
    }

    @Override
    public DoctorResponse updateDoctorClinic(Long doctorId, Long newClinicId){
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(()-> new RuntimeException("Không tìm thaays bác sỹ"));
        Clinic clinic = clinicRepository.findById(newClinicId)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy phòng khám này"));

        doctor.setClinic(clinic);
        Doctor updateDoctor = doctorRepository.save(doctor);

        return mapToDoctor(updateDoctor);
    }


    private DoctorResponse mapToDoctor(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getUser() != null ? doctor.getUser().getFullName() : null)
                .specialtyName(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .clinicName(doctor.getClinic() != null ? doctor.getClinic().getName() : null)
                .price(doctor.getPrice())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .biography(doctor.getBiography())
                .photoUrl(doctor.getPhotoUrl())
                .isVerified(doctor.getIsVerified())
                .rating(doctor.getRating())
                .build();
    }
}
