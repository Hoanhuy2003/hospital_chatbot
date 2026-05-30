package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.FollowUpResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import com.nguyenhuyhoan.hospital.models.Notification;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.MedicalRecordRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService implements IMedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final INotificationService notificationService;

    @Override
    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordDTO medicalRecordDTO) throws DataNotFoundException {
        if (medicalRecordDTO.getAppointmentId() == null) {
            throw new IllegalArgumentException("Thiếu appointment_id.");
        }

        Appointment appointment = appointmentRepository.findById(medicalRecordDTO.getAppointmentId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy cuộc hẹn"));

        if (medicalRecordRepository.existsByAppointmentId(appointment.getId())) {
            throw new IllegalStateException("Cuộc hẹn này đã có bệnh án, không thể tạo thêm.");
        }

        LocalDate followUp = medicalRecordDTO.getFollowUpDate();
        if (followUp != null) {
            validateFollowUpDate(followUp, appointment);
        }

        MedicalRecord record = MedicalRecord.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .symptoms(medicalRecordDTO.getSymptoms())
                .diagnosis(medicalRecordDTO.getDiagnosis())
                .treatment(medicalRecordDTO.getTreatment())
                .prescription(medicalRecordDTO.getPrescription())
                .photoUrl(medicalRecordDTO.getPhotoUrl())
                .followUpDate(followUp)
                .name("Bệnh án ngày: " + LocalDate.now())
                .build();

        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        if (followUp != null) {
            sendFollowUpNotifications(savedRecord, appointment, followUp);
        }

        return MedicalRecordResponse.fromMedicalRecord(savedRecord);
    }

    private static void validateFollowUpDate(LocalDate followUp, Appointment appointment) {
        LocalDate today = LocalDate.now();
        if (followUp.isBefore(today)) {
            throw new IllegalArgumentException("Ngày tái khám không được ở quá khứ.");
        }
        if (appointment.getSchedule() != null && appointment.getSchedule().getDate() != null) {
            LocalDate visitDate = appointment.getSchedule().getDate();
            if (followUp.isBefore(visitDate)) {
                throw new IllegalArgumentException("Ngày tái khám phải từ ngày khám trở đi.");
            }
        }
    }

    private void sendFollowUpNotifications(MedicalRecord record, Appointment appointment, LocalDate followUp) {
        try {
            User patient = appointment.getPatient();
            Doctor doctor = appointment.getDoctor();
            String doctorName = doctor.getUser() != null ? doctor.getUser().getFullName() : "bác sĩ";
            String diagnosis = record.getDiagnosis() != null ? record.getDiagnosis().trim() : "";
            long days = ChronoUnit.DAYS.between(LocalDate.now(), followUp);

            String patientMsg = String.format(
                    "Bác sĩ %s gợi ý bạn tái khám vào ngày %s%s. Vui lòng đặt lịch trên hệ thống trước ngày đó.",
                    doctorName,
                    followUp,
                    diagnosis.isEmpty() ? "" : " (chẩn đoán: " + diagnosis + ")"
            );
            notificationService.sendNotification(
                    patient.getId(),
                    "Nhắc tái khám",
                    patientMsg,
                    Notification.Type.RE_EXAM
            );

            if (doctor.getUser() != null) {
                String doctorMsg = String.format(
                        "Bạn đã hẹn tái khám cho %s vào ngày %s (còn %d ngày).",
                        patient.getFullName(),
                        followUp,
                        days
                );
                notificationService.sendNotification(
                        doctor.getUser().getId(),
                        "Lịch tái khám đã ghi",
                        doctorMsg,
                        Notification.Type.SYSTEM
                );
            }
        } catch (Exception e) {
            System.err.println("Lỗi gửi thông báo tái khám: " + e.getMessage());
        }
    }

    @Override
    public List<MedicalRecordResponse> getPatientHistory(Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(MedicalRecordResponse::fromMedicalRecord)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalRecordResponse getDetail(Long id) throws DataNotFoundException {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy bệnh án"));
        return MedicalRecordResponse.fromMedicalRecord(record);
    }

    @Override
    public List<UserResponse> getPatientsByDoctor(Long doctorId) {
        List<User> patients = userRepository.findPatientsByDoctorId(doctorId);
        return patients.stream()
                .map(UserResponse::fromUser)
                .toList();
    }

    @Override
    public List<MedicalRecordResponse> getRecordByDoctor(Long userId) {
        List<MedicalRecord> records = medicalRecordRepository.findAllByUserId(userId);
        return records.stream().map(record -> MedicalRecordResponse.builder()
                .id(record.getId())
                .patientName(record.getAppointment().getPatient().getFullName())
                .diagnosis(record.getDiagnosis())
                .followUpDate(record.getFollowUpDate())
                .symptoms(record.getSymptoms())
                .treatment(record.getTreatment())
                .prescription(record.getPrescription())
                .build()).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUpResponse> getNextAppointments(Long doctorUserId) {
        return medicalRecordRepository.findUpcomingFollowUps(doctorUserId)
                .stream()
                .map(this::toFollowUpResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUpResponse> getFollowUpsByPatient(Long patientId) {
        return medicalRecordRepository.findUpcomingFollowUpsByPatientId(patientId)
                .stream()
                .map(this::toFollowUpResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void assertCanAccessPatientRecords(UserDetailsImpl principal, Long patientId) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập.");
        }
        String role = principal.getRoleName();
        if ("ADMIN".equals(role) || "DOCTOR".equals(role)) {
            return;
        }
        if ("PATIENT".equals(role) && principal.getId().equals(patientId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem dữ liệu bệnh nhân này.");
    }

    @Override
    public void assertDoctorOwnsFollowUpList(UserDetailsImpl principal, Long doctorUserId) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập.");
        }
        if ("ADMIN".equals(principal.getRoleName())) {
            return;
        }
        if ("DOCTOR".equals(principal.getRoleName()) && principal.getId().equals(doctorUserId)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ được xem lịch tái khám của chính bạn.");
    }

    private FollowUpResponse toFollowUpResponse(MedicalRecord record) {
        Appointment appt = record.getAppointment();
        Doctor doctor = record.getDoctor();
        User patient = record.getPatient();
        LocalDate followUp = record.getFollowUpDate();
        long daysUntil = followUp != null
                ? ChronoUnit.DAYS.between(LocalDate.now(), followUp)
                : 0L;

        String diagnosis = record.getDiagnosis() != null ? record.getDiagnosis().trim() : "";
        String note = diagnosis.isEmpty() ? "Tái khám" : "Tái khám: " + diagnosis;
        String patientName = patient != null ? patient.getFullName() : "—";
        String phone = patient != null ? patient.getPhone() : null;
        String doctorName = doctor != null && doctor.getUser() != null
                ? doctor.getUser().getFullName() : "—";

        return FollowUpResponse.builder()
                .medicalRecordId(record.getId())
                .patientId(patient != null ? patient.getId() : null)
                .patientName(patientName)
                .patientPhone(phone)
                .doctorId(doctor != null ? doctor.getId() : null)
                .doctorUserId(doctor != null && doctor.getUser() != null ? doctor.getUser().getId() : null)
                .doctorName(doctorName)
                .specialtyId(doctor != null && doctor.getSpecialty() != null ? doctor.getSpecialty().getId() : null)
                .specialtyName(doctor != null && doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null)
                .clinicId(doctor != null && doctor.getClinic() != null ? doctor.getClinic().getId() : null)
                .clinicName(doctor != null && doctor.getClinic() != null ? doctor.getClinic().getName() : null)
                .previousAppointmentId(appt != null ? appt.getId() : null)
                .followUpDate(followUp)
                .daysUntil(daysUntil)
                .diagnosis(diagnosis)
                .date(followUp != null ? followUp.toString() : null)
                .name(patientName)
                .note(note)
                .phone(phone)
                .build();
    }

    @Override
    public MedicalRecordResponse getByAppointment(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy bệnh án"));
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .appointmentId(record.getAppointment().getId())
                .patientName(record.getPatient().getFullName())
                .doctorName(record.getDoctor().getUser().getFullName())
                .symptoms(record.getSymptoms())
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .prescription(record.getPrescription())
                .photoUrl(record.getPhotoUrl())
                .followUpDate(record.getFollowUpDate())
                .createdAt(record.getCreatedAt())
                .build();
    }

    @Override
    public List<MedicalRecordResponse> getAll(String keyword, String date) {
        LocalDate parsedDate = null;
        if (date != null && !date.isBlank()) {
            try {
                parsedDate = LocalDate.parse(date);
            } catch (Exception ignored) {
            }
        }
        return medicalRecordRepository
                .findAllWithFilter(keyword, parsedDate)
                .stream()
                .map(MedicalRecordResponse::fromMedicalRecord)
                .collect(Collectors.toList());
    }
}
