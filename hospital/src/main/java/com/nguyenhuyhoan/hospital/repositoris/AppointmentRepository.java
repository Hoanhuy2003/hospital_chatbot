package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(Long patientId);

   // List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<Appointment> findAllByStatus(Appointment.Status status);

    List<Appointment> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.doctor
            JOIN FETCH a.schedule s
            JOIN FETCH s.doctor sd
            JOIN FETCH sd.user
            JOIN FETCH s.clinic c
            JOIN FETCH c.specialty
            WHERE sd.user.id = :userId
            """)
    List<Appointment> findByDoctorUserId(@Param("userId") Long userId);

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.patient
            JOIN FETCH a.doctor
            JOIN FETCH a.schedule s
            JOIN FETCH s.doctor sd
            JOIN FETCH sd.user
            JOIN FETCH s.clinic c
            JOIN FETCH c.specialty
            WHERE a.id = :id
            """)
    Optional<Appointment> findByIdWithDetails(@Param("id") Long id);

    List<Appointment> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(a) FROM Appointment a WHERE CAST(a.appointmentTime AS date) = :date")
    long countByDate(@Param("date") LocalDate date);

    // Lấy 5 bản ghi mới nhất dựa trên thời gian tạo
    List<Appointment> findTop5ByOrderByCreatedAtDesc();

    // lấy lịch tái khám
}
