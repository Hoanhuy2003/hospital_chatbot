package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Clinic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicRepository extends JpaRepository<Clinic, Long> {

    Page<Clinic> findByNameContaining(String name, Pageable pageable);
}
