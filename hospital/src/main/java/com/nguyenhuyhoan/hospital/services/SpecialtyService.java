package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.SpecialtyResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.ISpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialtyService implements ISpecialtyService {





    @Override
    public SpecialtyResponse createSpecialty(SpecialtyDTO specialtyDTO) throws DataNotFoundException {
        return null;
    }

    @Override
    public List<SpecialtyResponse> getAll() {
        return List.of();
    }
}
