package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.ChatbotFaq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatbotFaqRepository extends JpaRepository<ChatbotFaq, Long> {
    List<ChatbotFaq> findByIsActiveTrueOrderByPriorityDesc();

    // Tìm kiếm mờ theo nội dung câu hỏi
    @Query("SELECT f FROM ChatbotFaq f WHERE f.isActive = true AND " +
            "(LOWER(f.question) LIKE LOWER(CONCAT('%', :text, '%')) OR " +
            "LOWER(f.keywords) LIKE LOWER(CONCAT('%', :text, '%')))")
    List<ChatbotFaq> searchFaq(@Param("text") String text);
}
