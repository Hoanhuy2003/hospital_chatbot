package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.SpecialtyResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;

import java.util.List;

public interface ISpecialtyService {
    SpecialtyResponse createSpecialty(SpecialtyDTO specialtyDTO)  throws DataNotFoundException;
    List<SpecialtyResponse> getAll();
}
