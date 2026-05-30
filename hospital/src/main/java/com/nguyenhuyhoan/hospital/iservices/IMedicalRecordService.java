package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.FollowUpResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsImpl;

import java.util.List;

public interface IMedicalRecordService {


    MedicalRecordResponse createMedicalRecord(MedicalRecordDTO medicalRecordDTO) throws DataNotFoundException;

    List<MedicalRecordResponse> getPatientHistory(Long patientId);

    MedicalRecordResponse getDetail(Long id) throws DataNotFoundException;

    List<UserResponse> getPatientsByDoctor(Long doctorId);

    List<MedicalRecordResponse> getRecordByDoctor(Long doctorId);

    List<FollowUpResponse> getNextAppointments(Long doctorUserId);

    List<FollowUpResponse> getFollowUpsByPatient(Long patientId);

    void assertCanAccessPatientRecords(UserDetailsImpl principal, Long patientId);

    void assertDoctorOwnsFollowUpList(UserDetailsImpl principal, Long doctorUserId);

    MedicalRecordResponse getByAppointment(Long appointmentId);

    List<MedicalRecordResponse> getAll(String keyword, String date);
}
