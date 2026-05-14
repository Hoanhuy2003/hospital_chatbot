package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.MedicalRecordRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService implements IMedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordDTO medicalRecordDTO) throws DataNotFoundException {
        Appointment appointment = appointmentRepository.findById(medicalRecordDTO.getAppointmentId())
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy cuộc hẹn"));

        MedicalRecord record = MedicalRecord.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .symptoms(medicalRecordDTO.getSymptoms())
                .diagnosis(medicalRecordDTO.getDiagnosis())
                .treatment(medicalRecordDTO.getTreatment())
                .prescription(medicalRecordDTO.getPrescription())
                .photoUrl(medicalRecordDTO.getPhotoUrl())
                .followUpDate(medicalRecordDTO.getFollowUpDate())
                .name("Bệnh án ngày: " + LocalDate.now())

                .build();

        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);

        MedicalRecord saveRecord = medicalRecordRepository.save(record);
        return MedicalRecordResponse.fromMedicalRecord(saveRecord);
    }

    @Override
    public List<MedicalRecordResponse> getPatientHistory(Long patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId);

        return records.stream()
                .map(MedicalRecordResponse::fromMedicalRecord)
                .collect(Collectors.toList());

    }

    @Override
    public MedicalRecordResponse getDetail(Long id) throws DataNotFoundException {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy bệnh án"));
        return MedicalRecordResponse.fromMedicalRecord(record);
    }

    @Override
    public List<UserResponse> getPatientsByDoctor(Long doctorId) {
        List<User> patients = userRepository.findPatientsByDoctorId(doctorId);

        return patients.stream()
                .map(UserResponse :: fromUser)
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
    public List<Map<String, Object>> getNextAppointments(Long doctorOrUserId) {
        List<MedicalRecord> records = medicalRecordRepository.findUpcomingFollowUps(doctorOrUserId);

        return records.stream().map(record ->{
            Map<String, Object> item = new HashMap<>();
            item.put("date", record.getFollowUpDate().toString());
            // Lấy tên từ User thông qua Appointment
            item.put("name", record.getAppointment().getPatient().getFullName());
            // Lấy chẩn đoán cũ làm ghi chú cho lần tái khám
            item.put("note", "Tái khám: " + record.getDiagnosis());
            // Lấy số điện thoại từ User
            item.put("phone", record.getAppointment().getPatient().getPhone());
            return item;
        }).toList();

    }

    @Override
    public MedicalRecordResponse getByAppointment(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy bệnh án"));
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
            try { parsedDate = LocalDate.parse(date); } catch (Exception ignored) {}
        }
        return medicalRecordRepository
                .findAllWithFilter(keyword, parsedDate)
                .stream()
                .map(MedicalRecordResponse::fromMedicalRecord)
                .collect(Collectors.toList());
    }
}
