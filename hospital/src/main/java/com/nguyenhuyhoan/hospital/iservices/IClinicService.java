package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ClinicResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IClinicService {
    ClinicResponse createClinic(ClinicDTO clinicDTO) throws DataNotFoundException;

    Page<ClinicResponse> getAllClinics(Pageable pageable);

    ClinicResponse getClinicById(Long id) throws  DataNotFoundException;

    ClinicResponse updateClinic(Long id, ClinicDTO clinicDTO) throws DataNotFoundException;

    void deleteClinic(Long id) throws DataNotFoundException;
}
