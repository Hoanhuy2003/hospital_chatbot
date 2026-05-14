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
    private double monthlyRevenue;   // Doanh thu tháng này (số thực)
    private double totalRevenue;     // Tổng doanh thu tất cả thời gian
    private long paidCount;          // Số hóa đơn đã thanh toán
    private long pendingCount;       // Số hóa đơn chờ thanh toán
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
