package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.DoctorResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.SpecialtyResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;

import java.io.IOException;
import java.util.List;

public interface ISpecialtyService {
    SpecialtyResponse createSpecialty(SpecialtyDTO specialtyDTO)  throws IOException;
    List<SpecialtyResponse> getAll();
    SpecialtyResponse updateSpecialty(Long id, SpecialtyDTO specialtyDTO) throws IOException;

    List<DoctorResponse> getDoctorBySpecialty(Long specialtyId);
}
