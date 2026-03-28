package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.ScheduleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, Long> {

    // Tìm tất cả các lịch mẫu đang ở trạng thái hoạt động để chạy Auto
    List<ScheduleTemplate> findByIsActiveTrue();

    // Tìm lịch mẫu theo ID bác sĩ (để quản lý/chỉnh sửa sau này)
    List<ScheduleTemplate> findByDoctorId(Long doctorId);
}
