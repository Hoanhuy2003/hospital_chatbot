package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<Schedule> findByClinicIdAndDate(Long clinicId, LocalDate date);

    // Tìm các lịch có ngày nhỏ hơn ngày hiện tại và đang hoạt động
    List<Schedule> findByDateBeforeAndIsActiveTrue(LocalDate date);


    // kiểm tra lịch trống
    boolean existsByDoctorIdAndDateAndTimeSlot(Long doctorId, LocalDate date, String timeSlot);

    List<Schedule> findByDoctorIdAndDateOrderByTimeSlotAsc(Long doctorId, LocalDate date);

    // Tìm các lịch khám của bác sĩ thuộc chuyên khoa X trong ngày Y mà chưa đầy bệnh nhân
    @Query("SELECT s FROM Schedule s " +
            "WHERE s.doctor.specialty.id = :specialtyId " +
            "AND s.date = :date " +
            "AND s.currentPatients < s.maxPatients")
    List<Schedule> findSchedulesBySpecialtyAndDate(
            @Param("specialtyId") Long specialtyId,
            @Param("date") LocalDate date);


}
