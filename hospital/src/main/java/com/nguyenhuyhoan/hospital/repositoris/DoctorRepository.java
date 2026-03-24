package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import javax.print.Doc;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE " +
            "(:name IS NULL OR u.fullName LIKE %:name%) AND " +
            "(:specialtyId IS NULL OR d.specialty.id = :specialtyId)")
    Page<Doctor> searchDoctors(String keyword, Long specialtyId, Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.clinic.id = :clinicId")
    List<Doctor> findByClinicId(Long clinicId);

}
