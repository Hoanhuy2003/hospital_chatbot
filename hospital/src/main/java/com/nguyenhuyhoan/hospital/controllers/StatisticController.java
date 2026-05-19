package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.SpecialtyRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import com.nguyenhuyhoan.hospital.repositoris.ClinicRepository; // Đã thêm để đếm số phòng thực tế

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Đảm bảo ReactJS gọi vào không bị chặn CORS
public class StatisticController {

    // Tiêm đầy đủ cả 4 Repository vào để phục vụ việc đếm động
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final ClinicRepository clinicRepository;

    @GetMapping("/home-stats")
    public ResponseEntity<Map<String, Long>> getHomeStatistics() {
        Map<String, Long> stats = new HashMap<>();

        // Đếm thực tế số dòng của từng bảng dưới MySQL
        stats.put("patientsCount", userRepository.count());       // Tổng số bệnh nhân
        stats.put("doctorsCount", doctorRepository.count());        // Tổng số bác sĩ
        stats.put("specialtiesCount", specialtyRepository.count());  // Tổng số chuyên khoa
        stats.put("clinicsCount", clinicRepository.count());        // Tổng số phòng khám/phòng chức năng

        return ResponseEntity.ok(stats);
    }
}