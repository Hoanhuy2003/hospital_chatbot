package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.responses.NotificationResponse;
import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final INotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@PathVariable Long userId){
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> read(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Đã đọc thông báo");
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<String> readAll(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("Đã đọc tất cả thông báo");
    }



        @MessageMapping("/hello") // Client gửi tới /app/hello
        @SendTo("/topic/notifications") // Server trả về /topic/notifications
        public NotificationResponse greeting(String message) {
            return NotificationResponse.builder()
                    .title("Server nhận được tin!")
                    .message("Bạn vừa nói: " + message)
                    .build();
        }

}
