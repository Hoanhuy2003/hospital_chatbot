package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicStatDTO;
import com.nguyenhuyhoan.hospital.models.Clinic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    Page<Clinic> findByNameContaining(String name, Pageable pageable);

    @Query("SELECT new com.nguyenhuyhoan.hospital.dtos.requests.ClinicStatDTO(" +
            "c.id, c.name, c.address, c.phone, s.id, s.name, c.description, c.isActive, " +
            "COUNT(d.id)) " +
            "FROM Clinic c " +
            "LEFT JOIN c.specialty s " +
            "LEFT JOIN Doctor d ON d.clinic.id = c.id " +
            "GROUP BY c.id, c.name, c.address, c.phone, s.id, s.name, c.description, c.isActive")
    List<ClinicStatDTO> getClinicStatistics();
}
