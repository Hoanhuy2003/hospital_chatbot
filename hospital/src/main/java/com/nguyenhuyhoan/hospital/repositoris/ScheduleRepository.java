package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<Schedule> findByClinicIdAndDate(Long clinicId, LocalDate date);

    // Tìm các lịch có ngày nhỏ hơn ngày hiện tại và đang hoạt động
    List<Schedule> findByDateBeforeAndIsActiveTrue(LocalDate date);


    // kiểm tra lịch trống
    boolean existsByDoctorIdAndDateAndTimeSlot(Long doctorId, LocalDate date, String timeSlot);
}
