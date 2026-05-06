package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    // Spring sẽ tự hiểu: Tìm theo patient.id và sắp xếp theo createdAt giảm dần
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    // Nếu bạn muốn tìm theo Doctor ID cũng tương tự:
    List<MedicalRecord> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    // danh sách bệnh án của bác sỹ
    @Query("SELECT m FROM MedicalRecord m WHERE m.appointment.doctor.id = :doctorId ORDER BY m.createdAt DESC")
    List<MedicalRecord> findAllByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT m FROM MedicalRecord m " +
            "WHERE m.appointment.doctor.user.id = :userId " +
            "ORDER BY m.createdAt DESC")
    List<MedicalRecord> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM MedicalRecord m " +
            "WHERE m.appointment.doctor.id = :doctorId " +
            "AND m.reExaminationDate >= CURRENT_DATE " +
            "ORDER BY m.reExaminationDate ASC")
    List<MedicalRecord> findUpcomingFollowUps(@Param("doctorId") Long doctorId);
}
