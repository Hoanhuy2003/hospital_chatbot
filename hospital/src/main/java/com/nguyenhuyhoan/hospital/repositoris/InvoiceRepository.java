package com.nguyenhuyhoan.hospital.repositoris;


import com.nguyenhuyhoan.hospital.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // Giúp Hoàn kiểm tra xem một bệnh án đã được lập hóa đơn hay chưa
    Optional<Invoice> findByMedicalRecordId(Long medicalRecordId);

    // Kiểm tra tồn tại hóa đơn cho bệnh án
    boolean existsByMedicalRecordId(Long medicalRecordId);

    // Tìm hóa đơn theo mã bệnh án và trạng thái (ví dụ: tìm hóa đơn chưa thanh toán)
    Optional<Invoice> findByMedicalRecordIdAndStatus(Long medicalRecordId, String status);
}
