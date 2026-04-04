package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.enums.ChannelType;
import com.nguyenhuyhoan.hospital.enums.Message;
import com.nguyenhuyhoan.hospital.enums.Sender;
import com.nguyenhuyhoan.hospital.enums.StatusSession;
import com.nguyenhuyhoan.hospital.models.*;
import com.nguyenhuyhoan.hospital.repositoris.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatbotService {
    private final ChatbotFaqRepository chatbotFaqRepository;
    private final SymptomSpecialtyMappingRepository symptomRepository;
    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

//    public String getBotResponse(String userMessage){
//
//        // kiểm tra faq( địa chỉ, thủ tục)
//        String cleanMessage = userMessage.toLowerCase().trim();
//
//        List<ChatbotFaq> faqList = chatbotFaqRepository.searchFaq(cleanMessage);
//
//        if(!faqList.isEmpty()){
//            return faqList.get(0).getAnswer();
//        }
//
//        // kiểm tra triệu chứng
//        List<SymptomSpecialtyMapping> symptoms = symptomRepository.findMatchedSymptoms(cleanMessage);
//        if(!symptoms.isEmpty()){
//            SymptomSpecialtyMapping match = symptoms.get(0);
//            String specialtyName = match.getSpecialty().getName();
//
//            return "Dựa trên triệu chứng '" + match.getSymptomName() + "' bạn mô tả, " +
//                    "tôi khuyên bạn nên đăng ký khám tại: **" + specialtyName + "**. " +
//                    "Ghi chú: " + (match.getDescription() != null ? match.getDescription() : "Đây là chuyên khoa phù hợp nhất.");
//        }
//
//
//        return "Xin lỗi, tôi chưa hiểu ý bạn";
//    }

    @Transactional
    public String processChat(Long userId, String userContent) {
        ChatSession session = sessionRepository.findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, StatusSession.ACTIVE)
                .orElseGet(()-> createNewSession(userId));
        saveMessage(session, userContent, Sender.USER, Message.TEXT);

        String botReply = "Dữ liệu trả về từ logic của bạn...";

        saveMessage(session, botReply, Sender.BOT, Message.TEXT);

        // BƯỚC 3: Tra cứu FAQ (Hỏi đáp nhanh)
        List<ChatbotFaq> faqs = chatbotFaqRepository.searchFaq(userContent.toLowerCase());
        if (!faqs.isEmpty()) {
            String faqAnswer = faqs.get(0).getAnswer();
            saveMessage(session, faqAnswer, Sender.BOT, Message.TEXT);
            return faqAnswer;
        }

        // BƯỚC 4: Tra cứu Triệu chứng (Tư vấn chuyên khoa)
        List<SymptomSpecialtyMapping> symptoms = symptomRepository.findMatchedSymptoms(userContent.toLowerCase());
        if (!symptoms.isEmpty()) {
            SymptomSpecialtyMapping match = symptoms.get(0);
            String symptomAnswer = "Dựa trên triệu chứng '" + match.getSymptomName() +
                    "', bạn nên khám tại: " + match.getSpecialty().getName();
            saveMessage(session, symptomAnswer, Sender.BOT, Message.TEXT);
            return symptomAnswer;
        }

        // BƯỚC 5: Gọi AI (Tạm thời trả về câu mặc định, tí nữa mình sẽ lắp Python vào đây)
        String fallbackAnswer = "Tôi chưa rõ ý bạn, bạn có thể mô tả kỹ hơn hoặc để tôi kết nối với tư vấn viên nhé?";

        // BƯỚC 6: Phản hồi & Lưu tin nhắn của Bot (BOT)
        saveMessage(session, fallbackAnswer, Sender.BOT, Message.TEXT);

        return fallbackAnswer;

    }

    private ChatSession createNewSession(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return sessionRepository.save(ChatSession.builder()
                .user(user)
                .sessionId(UUID.randomUUID().toString()) // Tạo chuỗi ngẫu nhiên cho session_id
                .channelType(ChannelType.WEB)
                .status(StatusSession.ACTIVE)
                .build());
    }

    private void saveMessage(ChatSession session, String content, Sender sender, Message type) {
        ChatMessage message = ChatMessage.builder()
                .session(session)
                .senderType(sender)
                .messageType(type)
                .messageText(content) // Lưu dạng JSON cho trường payload
                .build();
        messageRepository.save(message);
    }


}
