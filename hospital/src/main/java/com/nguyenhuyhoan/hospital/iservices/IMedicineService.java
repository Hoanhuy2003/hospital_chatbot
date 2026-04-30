package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicineDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicineResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;

import java.util.List;

public interface IMedicineService {
    MedicineResponse create (MedicineDTO medicineDTO) throws DataNotFoundException;

    MedicineResponse update(Long id, MedicineDTO medicineDTO) throws DataNotFoundException;

    void delete(Long id);

    List<MedicineResponse> getBySpecialty(Long specialtyId);

    MedicineResponse getById(Long id) throws DataNotFoundException;

    List<MedicineResponse> getAll();
}
