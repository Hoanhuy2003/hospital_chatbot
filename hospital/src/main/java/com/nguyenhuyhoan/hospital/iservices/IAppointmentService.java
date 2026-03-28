package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.AppointmentDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.AppointmentResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;

import java.util.List;

public interface IAppointmentService {

    AppointmentResponse createAppointment(AppointmentDTO appointmentDTO) throws DataNotFoundException;

    AppointmentResponse getById(Long id) throws DataNotFoundException;

    List<AppointmentResponse> getByPatient(Long patientId);

    AppointmentResponse updateStatus(Long id, String status) throws DataNotFoundException;
}
