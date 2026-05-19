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
    public ResponseEntity<?> chat(@RequestBody ChatDTO request) { // Đổi sang ResponseEntity<?>
        try {
            // Thực hiện toàn bộ 6 bước xử lý dưới Service
            String reply = chatbotService.processChat(request.getUserId(), request.getMessage());

            // BỌC VÀO MAP ĐỂ TRẢ VỀ ĐỊNH DẠNG JSON CHUẨN: {"reply": "..."}
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            e.printStackTrace();
            // Trả về lỗi dạng JSON cho đồng bộ hệ thống
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
}