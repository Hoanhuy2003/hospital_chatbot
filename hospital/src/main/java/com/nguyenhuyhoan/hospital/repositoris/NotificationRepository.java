package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<com.nguyenhuyhoan.hospital.models.Notification, Long> {
    // Lấy thông báo của User, cái mới nhất hiện lên đầu
    List<Notification> findByUserIdOrderBySentAtDesc(Long userId);

    // Đếm xem người dùng có bao nhiêu thông báo chưa đọc để hiện số đỏ trên App
    long countByUserIdAndIsReadFalse(Long userId);
}
