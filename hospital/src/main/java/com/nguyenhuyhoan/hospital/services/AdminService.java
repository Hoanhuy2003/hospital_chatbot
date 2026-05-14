package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.AdminDashboardDTO;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.InvoiceRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository       userRepository;
    private final DoctorRepository     doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository    invoiceRepository;

    public AdminDashboardDTO getDashboardStat() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM");

        long totalUsers   = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long todayApts    = appointmentRepository.countByDate(today);

        // Doanh thu thực từ DB
        double monthlyRevenue = invoiceRepository.sumMonthlyRevenue(today.getMonthValue(), today.getYear());
        double totalRevenue   = invoiceRepository.sumRevenue();
        long   paidCount      = invoiceRepository.countByStatus("PAID");
        long   pendingCount   = invoiceRepository.countByStatus("PENDING");

        // 5 lịch khám mới nhất
        var recentApts = appointmentRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(a -> {
                    String time = a.getAppointmentTime() != null
                            ? a.getAppointmentTime().format(formatter)
                            : (a.getSchedule() != null ? a.getSchedule().getDate().toString() : "—");
                    String specialty = (a.getDoctor() != null && a.getDoctor().getSpecialty() != null)
                            ? a.getDoctor().getSpecialty().getName()
                            : (a.getSchedule() != null && a.getSchedule().getClinic() != null
                               ? a.getSchedule().getClinic().getSpecialty().getName() : "—");
                    return new AdminDashboardDTO.RecentAptDTO(
                            a.getId(),
                            a.getPatient() != null ? a.getPatient().getFullName() : a.getName(),
                            specialty,
                            time,
                            a.getStatus().toString()
                    );
                })
                .collect(Collectors.toList());

        return AdminDashboardDTO.builder()
                .totalUsers(totalUsers)
                .totalDoctors(totalDoctors)
                .todayAppointments(todayApts)
                .monthlyRevenue(monthlyRevenue)
                .totalRevenue(totalRevenue)
                .paidCount(paidCount)
                .pendingCount(pendingCount)
                .recentAppointments(recentApts)
                .build();
    }
}
