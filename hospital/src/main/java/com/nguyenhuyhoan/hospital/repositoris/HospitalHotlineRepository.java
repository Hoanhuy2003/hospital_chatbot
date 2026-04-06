package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.HospitalHotline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HospitalHotlineRepository extends JpaRepository<HospitalHotline,Long> {
    List<HospitalHotline> findByIsActiveTrue();
}
