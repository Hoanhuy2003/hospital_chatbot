package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByMedicalRecordId(Long medicalRecordId);

    boolean existsByMedicalRecordId(Long medicalRecordId);

    Optional<Invoice> findByMedicalRecordIdAndStatus(Long medicalRecordId, String status);

    // Admin: lọc danh sách hóa đơn theo tên BN / trạng thái / khoảng ngày
    @Query("SELECT i FROM Invoice i " +
           "WHERE (:keyword IS NULL OR :keyword = '' " +
           "       OR LOWER(i.medicalRecord.appointment.patient.fullName) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "AND (:status IS NULL OR :status = '' OR i.status = :status) " +
           "AND (:dateFrom IS NULL OR CAST(i.createdAt AS date) >= :dateFrom) " +
           "AND (:dateTo   IS NULL OR CAST(i.createdAt AS date) <= :dateTo) " +
           "ORDER BY i.createdAt DESC")
    List<Invoice> findAllWithFilter(
            @Param("keyword")  String keyword,
            @Param("status")   String status,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo")   LocalDate dateTo);

    // Stats: tổng doanh thu đã thanh toán
    @Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM Invoice i WHERE i.status = 'PAID'")
    Double sumRevenue();

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = :status")
    Long countByStatus(@Param("status") String status);

    // Doanh thu tháng hiện tại
    @Query("SELECT COALESCE(SUM(i.finalAmount), 0) FROM Invoice i " +
           "WHERE i.status = 'PAID' " +
           "AND MONTH(i.createdAt) = :month AND YEAR(i.createdAt) = :year")
    Double sumMonthlyRevenue(@Param("month") int month, @Param("year") int year);
}
