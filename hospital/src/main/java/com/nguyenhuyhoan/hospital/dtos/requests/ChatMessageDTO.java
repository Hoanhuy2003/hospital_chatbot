package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("session_id")
    private Long sessionId;

    @JsonProperty("sender_type")
    private String senderType; // USER, BOT, SYSTEM

    @JsonProperty("message_type")
    private String messageType; // TEXT, QUICK_REPLY, BUTTON, CAROUSEL

    @JsonProperty("message_text")
    private String messageText;

    @JsonProperty("payload")
    private String payload; // Chứa dữ liệu JSON cho các loại tin nhắn đặc biệt (nút bấm, link ảnh)

    @JsonProperty("intent_name")
    private String intentName; // Ý định mà AI nhận diện được (ví dụ: "ask_doctor_info")

    @JsonProperty("intent_confidence")
    private BigDecimal intentConfidence; // Độ tin cậy của AI

    @JsonProperty("entities")
    private String entities; // Các thực thể AI bóc tách được (ví dụ: "doctor_name": "Nguyễn Văn A")

    @JsonProperty("create_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createAt;
}
