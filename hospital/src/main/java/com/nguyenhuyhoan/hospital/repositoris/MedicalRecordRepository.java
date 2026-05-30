package com.nguyenhuyhoan.hospital.repositoris;

import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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

//    @Query("SELECT m FROM MedicalRecord m " +
//            "WHERE m.appointment.doctor.id = :doctorId " +
//            "AND m.followUpDate >= CURRENT_DATE " +
//            "ORDER BY m.followUpDate ASC")
//    List<MedicalRecord> findUpcomingFollowUps(@Param("doctorId") Long doctorId);

    @Query("SELECT m FROM MedicalRecord m " +
            "WHERE m.appointment.doctor.user.id = :userId " +
            "AND m.followUpDate IS NOT NULL " +
            "AND m.followUpDate >= CURRENT_DATE " +
            "ORDER BY m.followUpDate ASC")
    List<MedicalRecord> findUpcomingFollowUps(@Param("userId") Long userId);

    @Query("SELECT m FROM MedicalRecord m " +
            "WHERE m.patient.id = :patientId " +
            "AND m.followUpDate IS NOT NULL " +
            "AND m.followUpDate >= CURRENT_DATE " +
            "ORDER BY m.followUpDate ASC")
    List<MedicalRecord> findUpcomingFollowUpsByPatientId(@Param("patientId") Long patientId);

    boolean existsByAppointmentId(Long appointmentId);

    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    // Admin: tìm tất cả bệnh án, lọc theo tên bệnh nhân/chẩn đoán và ngày lập
    @Query("SELECT m FROM MedicalRecord m " +
           "WHERE (:keyword IS NULL OR :keyword = '' " +
           "       OR LOWER(m.appointment.patient.fullName) LIKE LOWER(CONCAT('%',:keyword,'%')) " +
           "       OR LOWER(m.diagnosis) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "AND (:date IS NULL OR CAST(m.createdAt AS date) = :date) " +
           "ORDER BY m.createdAt DESC")
    List<MedicalRecord> findAllWithFilter(
            @Param("keyword") String keyword,
            @Param("date") java.time.LocalDate date);
}
