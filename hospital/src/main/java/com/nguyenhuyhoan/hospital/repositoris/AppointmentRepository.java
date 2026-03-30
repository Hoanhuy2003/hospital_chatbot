package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByCreatedAtDesc(Long patientId);

   // List<Appointment> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<Appointment> findAllByStatus(Appointment.Status status);
}
