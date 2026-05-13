package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardDTO {

    private long totalUsers;
    private long totalDoctors;
    private long todayAppointments;
    private String monthlyRevenue;
    private List<RecentAptDTO> recentAppointments;

    @Data
    @AllArgsConstructor
    public static class RecentAptDTO {
        private Long id;
        private String patientName;
        private String specialtyName;
        private String appointmentTime;
        private String status;
    }
}
