package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type")
    private Sender senderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private Message messageType;

    @Column(name = "payload", columnDefinition = "JSON")
    private String payload;

    @Column(name = "intent_name", length = 100)
    private String intentName;

    @Column(name = "intent_confidence")
    private BigDecimal intentConfidence;

    @Column(name = "entities", columnDefinition = "JSON")
    private String entities;

    @CreationTimestamp
    @Column(name = "create_at")
    private LocalDateTime createAt;

    private enum Sender {USER, BOT, SYSTEM}
    private enum Message {TEXT, QUICK_REPLY, BUTTON, CAROUSEL}
}
