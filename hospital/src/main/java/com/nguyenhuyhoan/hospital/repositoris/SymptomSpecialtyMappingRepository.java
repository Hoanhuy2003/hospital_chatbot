package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.SymptomSpecialtyMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SymptomSpecialtyMappingRepository extends JpaRepository<SymptomSpecialtyMapping, Long> {
    @Query("SELECT s FROM SymptomSpecialtyMapping s " +
            "JOIN FETCH s.specialty " +
            "WHERE LOWER(:message) LIKE LOWER(CONCAT('%', s.symptomName, '%')) " +
            "ORDER BY s.confidenceLevel DESC")
    List<SymptomSpecialtyMapping> findMatchedSymptoms(@Param("message") String message);

}
