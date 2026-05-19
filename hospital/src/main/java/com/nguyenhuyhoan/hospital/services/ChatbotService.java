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

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;

    @Value("${ai.python-url}")
    private String pythonAiUrl;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public String processChat(Long userId, String userContent) {
        ChatSession session = null;

        try {
            if (userId != null && userId > 0) {
                session = sessionRepository
                        .findFirstByUserIdAndStatusOrderByStartedAtDesc(userId, StatusSession.ACTIVE)
                        .orElseGet(() -> createNewSession(userId));

                if (session != null) {
                    saveMessage(session, userContent, Sender.USER, Message.TEXT);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi khởi tạo hoặc lưu session người dùng: {}", e.getMessage());
        }

        String botReply = resolveReply(userContent);

        if (session != null) {
            try {
                saveMessage(session, botReply, Sender.BOT, Message.TEXT);
            } catch (Exception e) {
                log.error("Lỗi khi lưu tin nhắn của Bot vào DB: {}", e.getMessage());
            }
        }

        return botReply;
    }

    private String resolveReply(String userContent) {
        if (userContent == null || userContent.trim().isEmpty()) {
            return "Tôi có thể giúp gì cho bạn?";
        }

        String clean = userContent.toLowerCase().trim();

        // 1. FAQ
        try {
            List<ChatbotFaq> faqs = chatbotFaqRepository.searchFaq(clean);
            if (!faqs.isEmpty()) {
                return faqs.get(0).getAnswer();
            }
        } catch (Exception e) {
            log.warn("Lỗi tra cứu bảng FAQ: {}", e.getMessage());
        }

        // 2. Triệu chứng → chuyên khoa + gợi ý bác sĩ & link đặt khám
        try {
            List<SymptomSpecialtyMapping> symptoms = symptomRepository.findMatchedSymptoms(clean);
            if (!symptoms.isEmpty()) {
                SymptomSpecialtyMapping match = symptoms.get(0);
                String intro = "Dựa trên triệu chứng **\"" + match.getSymptomName()
                        + "\"**, bạn nên được thăm khám tại khoa **" + match.getSpecialty().getName() + "**.\n\n";
                String extra = match.getDescription() != null ? match.getDescription() + "\n\n" : "";
                return intro + extra + buildDoctorBookingAdvice(match.getSpecialty());
            }
        } catch (Exception e) {
            log.warn("Lỗi tra cứu triệu chứng chuyên khoa: {}", e.getMessage());
        }

        // 3. Người dùng nhắc tên chuyên khoa (vd: \"khám nhi khoa\", \"bác sĩ tim mạch\")
        try {
            Specialty byName = findBestSpecialtyMentionInMessage(clean);
            if (byName != null) {
                String intro = "Bạn quan tâm **" + byName.getName() + "**.\n\n";
                return intro + buildDoctorBookingAdvice(byName);
            }
        } catch (Exception e) {
            log.warn("Lỗi ghép tên chuyên khoa: {}", e.getMessage());
        }

        // 4. AI (Python / Gemini)
        return callPythonAI(userContent);
    }

    /** Tìm chuyên khoa có tên xuất hiện trong câu (ưu tiên tên dài nhất khớp). */
    private Specialty findBestSpecialtyMentionInMessage(String cleanMessage) {
        List<Specialty> all = specialtyRepository.findAll();
        Specialty best = null;
        int bestLen = 0;
        String norm = cleanMessage.replaceAll("\\s+", " ");
        for (Specialty s : all) {
            if (s.getName() == null || s.getName().isBlank()) continue;
            String n = s.getName().toLowerCase().trim();
            if (n.length() < 2) continue;
            if (norm.contains(n) && n.length() > bestLen) {
                best = s;
                bestLen = n.length();
            }
        }
        return best;
    }

    private String buildDoctorBookingAdvice(Specialty specialty) {
        String listUrl = trimSlash(frontendUrl) + "/tim-kiem?specialtyId=" + specialty.getId();

        List<Doctor> doctors = doctorRepository.findBySpecialty(specialty).stream()
                .sorted(Comparator
                        .comparing(Doctor::getRating, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(d -> d.getUser() != null ? d.getUser().getFullName() : ""))
                .limit(8)
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("**Gợi ý bác sĩ bạn có thể đặt khám:**\n");

        if (doctors.isEmpty()) {
            sb.append("_Hiện chưa có bác sĩ được hiển thị cho khoa này trên hệ thống._\n");
        } else {
            int n = Math.min(doctors.size(), 5);
            for (int i = 0; i < n; i++) {
                Doctor d = doctors.get(i);
                String name = d.getUser() != null ? d.getUser().getFullName() : "Bác sĩ";
                String clinic = d.getClinic() != null ? d.getClinic().getName() : "—";
                String price = d.getPrice() != null
                        ? String.format("%,.0fđ/lượt", d.getPrice())
                        : "—";
                String detailUrl = trimSlash(frontendUrl) + "/bac-si/" + d.getId();
                sb.append(String.format(
                        "%d. **%s** — %s (%s)\n   🔗 Đặt lịch / xem hồ sơ: %s\n",
                        i + 1, name, clinic, price, detailUrl));
            }
        }

        sb.append("\n📋 **Xem toàn bộ bác sĩ của khoa & chọn lịch:**\n");
        sb.append(listUrl);
        sb.append("\n\n_(Đăng nhập tài khoản để đặt lịch nhanh hơn.)_");

        return sb.toString();
    }

    private static String trimSlash(String url) {
        if (url == null) return "";
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    @SuppressWarnings("unchecked")
    private String callPythonAI(String message) {
        try {
            Map<String, String> request = Map.of("message", message);
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonAiUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object reply = response.getBody().get("reply");
                if (reply != null) {
                    String text = reply.toString().trim();
                    String list = trimSlash(frontendUrl) + "/tim-kiem";
                    if (!text.contains(list) && !text.contains("tim-kiem")) {
                        text += "\n\n📋 **Đặt khám trực tuyến:** " + list;
                    }
                    return text;
                }
            }
        } catch (Exception e) {
            log.error("Không thể kết nối tới Server Python AI tại URL {}: {}", pythonAiUrl, e.getMessage());
        }
        String fallbackList = trimSlash(frontendUrl) + "/tim-kiem";
        return "Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể mô tả triệu chứng cụ thể hơn, hoặc vào **"
                + fallbackList
                + "** để chọn chuyên khoa và bác sĩ. Hotline: **024 3869 3731**.";
    }

    private ChatSession createNewSession(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

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
