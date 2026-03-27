package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IScheduleService;
import com.nguyenhuyhoan.hospital.models.Clinic;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.Schedule;
import com.nguyenhuyhoan.hospital.repositoris.ClinicRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicRepository clinicRepository;


    @Override
    @Transactional
    public void createSchedules(ScheduleDTO scheduleDTO) throws IOException {

        Doctor doctor = doctorRepository.findById(scheduleDTO.getDoctorId())
                .orElseThrow(()-> new DataNotFoundException("Không có bác sỹ này"));

        Clinic clinic = clinicRepository.findById(scheduleDTO.getClinicId())
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy phòng khám"));

        if(!doctor.getClinic().getId().equals(clinic.getId())){
            throw  new DataNotFoundException("Bác sỹ không  ở phòng này");
        }

        for(String slot : scheduleDTO.getTimeSlots()){
            if (scheduleRepository.existsByDoctorIdAndDateAndTimeSlot(doctor.getId(), scheduleDTO.getDate(),slot)){
                continue;
            }

            Schedule schedule = Schedule.builder()
                    .doctor(doctor)
                    .clinic(clinic)
                    .date(scheduleDTO.getDate())
                    .timeSlot(slot)
                    .maxPatients(scheduleDTO.getMaxPatients())
                    .currentPatients(0)
                    .isActive(true)
                    .build();
            scheduleRepository.save(schedule);
        }


    }

    @Override
    public List<ScheduleResponse> getSchedulesByDoctorAndDate(Long doctorId, LocalDate date) {

        return scheduleRepository.findByDoctorIdAndDate(doctorId, date)
                .stream()
                .map(ScheduleResponse::fromSchedule)
                .toList();
    }

    @Override
    public List<ScheduleResponse> getSchedulesByClinicAndDate(Long clinicId, LocalDate date) {
        return scheduleRepository.findByClinicIdAndDate(clinicId, date)
                .stream()
                .map(ScheduleResponse::fromSchedule)
                .toList();
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) throws DataNotFoundException {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy lịch"));

        schedule.setIsActive(false);
        scheduleRepository.save(schedule);

    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 0 * * ?")
    public void autoUpdateExpiredSchedules() {
        LocalDate today = LocalDate.now();
        List<Schedule> expiredSchedules = scheduleRepository.findByDateBeforeAndIsActiveTrue(today);

        if(!expiredSchedules.isEmpty()){
            expiredSchedules.forEach(schedule -> schedule.setIsActive(false));
            scheduleRepository.saveAll(expiredSchedules);
            System.out.println("Đã tự động đóng " + expiredSchedules.size() + " lịch khám quá hạn.");
        }

    }
}
