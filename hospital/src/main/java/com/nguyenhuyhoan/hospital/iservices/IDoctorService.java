package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.DoctorDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.DoctorResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;

public interface IDoctorService {

    DoctorResponse createDoctor(DoctorDTO dto) throws IOException;
    DoctorResponse updateDoctor(Long id, DoctorDTO doctorDTO) throws IOException;
    void deleteDoctor(Long id) throws IOException;
    DoctorResponse getDoctorById(Long id);
    Page<DoctorResponse> getAllDoctors(String keyword, Long specialtyId, Pageable pageable);

    void assignDoctorsToClinic(Long clinicId, List<Long> doctorIds);
}
