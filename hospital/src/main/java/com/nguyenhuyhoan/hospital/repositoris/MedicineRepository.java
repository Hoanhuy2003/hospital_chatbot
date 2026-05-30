package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("""
            SELECT m FROM Medicine m
            WHERE m.specialty.id = :specialtyId
            AND (m.isActive = true OR m.isActive IS NULL)
            ORDER BY m.name ASC
            """)
    List<Medicine> findAvailableBySpecialtyId(@Param("specialtyId") Long specialtyId);

    List<Medicine> findBySpecialtyIdAndIsActiveTrue(Long specialtyId);
    List<Medicine> findByIsActiveTrue();

    List<Medicine> findByNameContainingIgnoreCaseAndSpecialtyId(String name, Long specialtyId);
}
