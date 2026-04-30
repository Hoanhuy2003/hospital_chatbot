package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService implements IMedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
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
}
