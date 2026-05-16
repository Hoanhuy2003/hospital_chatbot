package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicStatDTO;
import com.nguyenhuyhoan.hospital.models.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE " +
            "(:name IS NULL OR u.fullName LIKE CONCAT('%', :name, '%')) AND " +
            "(:specialtyId IS NULL OR d.specialty.id = :specialtyId)")
    Page<Doctor> searchDoctors(
            @Param("name") String name,           // Phải khớp với :name
            @Param("specialtyId") Long specialtyId,
            Pageable pageable
    );

    @Query("SELECT d FROM Doctor d WHERE d.clinic.id = :clinicId")
    List<Doctor> findByClinicId(Long clinicId);

    List<Doctor> findBySpecialtyId(Long specialtyId);

    java.util.Optional<Doctor> findByUser_Id(Long userId);

}