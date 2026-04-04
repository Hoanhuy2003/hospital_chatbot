package com.nguyenhuyhoan.hospital.models;

import com.nguyenhuyhoan.hospital.enums.ChannelType;
import com.nguyenhuyhoan.hospital.enums.StatusSession;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Table(name = "chat_sessions")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100)
    private String name;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type")
    private ChannelType channelType;

    @Column(name = "session_id", unique = true, nullable = false, length = 100)
    private String sessionId;

    @CreationTimestamp
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @UpdateTimestamp
    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusSession status = StatusSession.ACTIVE;

    @Column(name = "context_json", columnDefinition = "JSON")
    private String contextJson;



}
