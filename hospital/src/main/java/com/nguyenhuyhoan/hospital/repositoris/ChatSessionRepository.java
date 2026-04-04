package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.enums.StatusSession;
import com.nguyenhuyhoan.hospital.models.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(Long userId, StatusSession session);
}
