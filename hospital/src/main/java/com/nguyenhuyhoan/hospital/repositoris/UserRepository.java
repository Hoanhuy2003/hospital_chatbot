package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT a.patient FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId AND a.status = 'DONE'")
    List<User> findPatientsByDoctorId(@Param("doctorId") Long doctorId);
}
