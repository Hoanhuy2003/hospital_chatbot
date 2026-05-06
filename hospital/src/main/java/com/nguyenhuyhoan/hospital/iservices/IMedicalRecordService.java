package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;

import java.util.List;
import java.util.Map;

public interface IMedicalRecordService {


    MedicalRecordResponse createMedicalRecord(MedicalRecordDTO medicalRecordDTO) throws DataNotFoundException;

    List<MedicalRecordResponse> getPatientHistory(Long patientId);

    MedicalRecordResponse getDetail(Long id) throws DataNotFoundException;

    List<UserResponse> getPatientsByDoctor(Long doctorId);

    List<MedicalRecordResponse> getRecordByDoctor(Long doctorId);

    List<Map<String, Object>> getNextAppointments(Long doctorOrUserId);
}
