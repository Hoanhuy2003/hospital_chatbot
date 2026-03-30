package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.responses.NotificationResponse;
import com.nguyenhuyhoan.hospital.models.Notification;

import java.util.List;

public interface INotificationService {
    void sendNotification(Long userId, String title, String message, Notification.Type type);

    List<NotificationResponse> getNotificationsByUserId(Long userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);
}
