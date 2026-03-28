package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleTemplateDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

public interface IScheduleService {

    void createSchedules(ScheduleDTO scheduleDTO) throws IOException;

    List<ScheduleResponse> getSchedulesByDoctorAndDate(Long doctorId, LocalDate date);

    List<ScheduleResponse> getSchedulesByClinicAndDate(Long clinicId, LocalDate date);

    void deleteSchedule(Long id) throws DataNotFoundException;

    void autoUpdateExpiredSchedules();

    void createScheduleTemplate(ScheduleTemplateDTO scheduleTemplateDTO) ;

    void autoGenerateSchedules();
}
