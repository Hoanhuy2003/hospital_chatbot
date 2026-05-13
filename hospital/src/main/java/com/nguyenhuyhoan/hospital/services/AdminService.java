package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.AdminDashboardDTO;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminDashboardDTO getDashboardStat(){
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long todayApts = appointmentRepository.countByDate(LocalDate.now());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM");

        var recentApts = appointmentRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(a -> new AdminDashboardDTO.RecentAptDTO(
                        a.getId(),
                        a.getPatient().getFullName(),
                        a.getDoctor().getSpecialty().getName(),
                        a.getAppointmentTime().format(formatter),
                        a.getStatus().toString()
                )).collect(Collectors.toList());

        return AdminDashboardDTO.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .todayAppointments(todayApts)
                .monthlyRevenue("45.2M đ")
                .recentAppointments(recentApts)
                .build();
    }
}
