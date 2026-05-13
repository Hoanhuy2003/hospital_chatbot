package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.models.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SpecialtyRepository extends JpaRepository<Specialty,Long> {

    @Query("SELECT new com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO$SpecialtyStatDTO(" +
            "s.id, s.name, s.description, s.iconUrl, " +
            "COUNT(DISTINCT d.id), " +
            "COUNT(DISTINCT d.clinic.id), " +
            "COUNT(a.id)) " +
            "FROM Specialty s " +
            "LEFT JOIN Doctor d ON d.specialty.id = s.id " +
            "LEFT JOIN Appointment a ON a.doctor.id = d.id " +
            "GROUP BY s.id, s.name, s.description, s.iconUrl")
    List<SpecialtyDTO.SpecialtyStatDTO> getSpecialtyStatistics();

}
