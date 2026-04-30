package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findBySpecialtyIdAndIsActiveTrue(Long specialtyId);
    List<Medicine> findByIsActiveTrue();

    List<Medicine> findByNameContainingIgnoreCaseAndSpecialtyId(String name, Long specialtyId);
}
