package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // Spring sẽ tự hiểu: Tìm theo patient.id và sắp xếp theo createdAt giảm dần
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    // Nếu bạn muốn tìm theo Doctor ID cũng tương tự:
    List<MedicalRecord> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
}
