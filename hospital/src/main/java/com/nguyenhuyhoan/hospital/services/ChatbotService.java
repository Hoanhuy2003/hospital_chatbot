package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.enums.ChannelType;
import com.nguyenhuyhoan.hospital.enums.Message;
import com.nguyenhuyhoan.hospital.enums.Sender;
import com.nguyenhuyhoan.hospital.enums.StatusSession;
import com.nguyenhuyhoan.hospital.models.*;
import com.nguyenhuyhoan.hospital.repositoris.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatbotFaqRepository chatbotFaqRepository;
    private final SymptomSpecialtyMappingRepository symptomRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.python-url}")
    private String pythonAiUrl;

    @Transactional
    public String processChat(Long userId, String userContent) {
        // Lưu tin nhắn người dùng (nếu đã đăng nhập thì gắn session)
        ChatSession session = null;
        if (userId != null) {
            session = sessionRepository
                    .findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, StatusSession.ACTIVE)
                    .orElseGet(() -> createNewSession(userId));
            saveMessage(session, userContent, Sender.USER, Message.TEXT);
        }

        String botReply = resolveReply(userContent);

        // Lưu câu trả lời bot vào session
        if (session != null) {
            saveMessage(session, botReply, Sender.BOT, Message.TEXT);
        }

        return botReply;
    }

    private String resolveReply(String userContent) {
        String clean = userContent.toLowerCase().trim();

        // 1. Tra cứu FAQ trước
        List<ChatbotFaq> faqs = chatbotFaqRepository.searchFaq(clean);
        if (!faqs.isEmpty()) {
            return faqs.get(0).getAnswer();
        }

        // 2. Mapping triệu chứng → chuyên khoa
        List<SymptomSpecialtyMapping> symptoms = symptomRepository.findMatchedSymptoms(clean);
        if (!symptoms.isEmpty()) {
            SymptomSpecialtyMapping match = symptoms.get(0);
            return "Dựa trên triệu chứng \"" + match.getSymptomName() + "\", bạn nên đến khám tại **"
                    + match.getSpecialty().getName() + "**. "
                    + (match.getDescription() != null ? match.getDescription() : "")
                    + " Bạn có muốn đặt lịch khám ngay không?";
        }

        // 3. Gọi Gemini AI qua Python FastAPI
        return callPythonAI(userContent);
    }

    @SuppressWarnings("unchecked")
    private String callPythonAI(String message) {
        try {
            Map<String, String> request = Map.of("message", message);
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonAiUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object reply = response.getBody().get("reply");
                if (reply != null) return reply.toString();
            }
        } catch (Exception e) {
            log.warn("Không thể gọi Python AI: {}", e.getMessage());
        }
        return "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể mô tả triệu chứng cụ thể hơn, hoặc gọi hotline **024 3869 3731** để được hỗ trợ trực tiếp.";
    }

    private ChatSession createNewSession(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return sessionRepository.save(ChatSession.builder()
                .user(user)
                .sessionId(UUID.randomUUID().toString())
                .channelType(ChannelType.WEB)
                .status(StatusSession.ACTIVE)
                .build());
    }

    private void saveMessage(ChatSession session, String content, Sender sender, Message type) {
        messageRepository.save(ChatMessage.builder()
                .session(session)
                .senderType(sender)
                .messageType(type)
                .messageText(content)
                .build());
    }
}
