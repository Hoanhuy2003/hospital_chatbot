package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.ChatDTO;
import com.nguyenhuyhoan.hospital.services.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chatbots")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody ChatDTO request) {
        try {
            // Bước này sẽ thực hiện toàn bộ 6 bước: Session -> Save -> FAQ -> Symptom -> AI -> Response
            String reply = chatbotService.processChat(request.getUserId(), request.getMessage());

            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            // Log lỗi ra console để Hoàn dễ debug
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }
}
