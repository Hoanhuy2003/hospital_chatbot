package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.responses.NotificationResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import com.nguyenhuyhoan.hospital.models.Notification;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.NotificationRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void sendNotification(Long userId, String title, String message, Notification.Type type) {
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new DataNotFoundException("User not found"));
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .type(type)
                .message(message)
                .isRead(false)
                .name("Thông báo hệ thống")
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderBySentAtDesc(userId).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType().name())
                        .isRead(n.getIsRead())
                        .sentAt(n.getSentAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(()-> new DataNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderBySentAtDesc(userId);
        unread.forEach(n -> {
            if(!n.getIsRead()){
                n.setIsRead(true);
                n.setReadAt(LocalDateTime.now());
            }
        });
        notificationRepository.saveAll(unread);

    }
}
