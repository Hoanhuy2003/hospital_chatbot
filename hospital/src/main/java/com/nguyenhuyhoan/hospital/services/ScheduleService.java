package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleTemplateDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IScheduleService;
import com.nguyenhuyhoan.hospital.models.Clinic;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.Schedule;
import com.nguyenhuyhoan.hospital.models.ScheduleTemplate;
import com.nguyenhuyhoan.hospital.repositoris.ClinicRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.ScheduleRepository;
import com.nguyenhuyhoan.hospital.repositoris.ScheduleTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService implements IScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;
    private final ClinicRepository clinicRepository;
    private final ScheduleTemplateRepository scheduleTemplateRepository;



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

        List<Schedule> schedules = scheduleRepository.findByDoctorIdAndDateOrderByTimeSlotAsc(doctorId, date);
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();



        return schedules.stream().map( s ->{
            LocalTime slotStart = LocalTime.parse(s.getTimeSlot().split("_")[0].trim());

            boolean isExpired = date.isBefore(today) || (date.equals(today) && slotStart.isBefore(now));

            int available = s.getMaxPatients() - s.getCurrentPatients();

            String status = "AVAILABLE";
            if(isExpired) status = "EXPIRED";
            else if (available <= 0) status = "FULL";
            else if (!s.getIsActive()) status = "LOCKED";

            return ScheduleResponse.builder()
                    .id(s.getId())
                    .timeSlot(s.getTimeSlot())
                    .date(s.getDate())
                    .status(status)
                    .build();

        }).collect(Collectors.toList());
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

    @Override
    public void createScheduleTemplate(ScheduleTemplateDTO scheduleTemplateDTO)  {
        Doctor doctor = doctorRepository.findById(scheduleTemplateDTO.getDoctorId())
                .orElseThrow(()-> new DataNotFoundException("Không tồn tại bác sỹ"));
        ScheduleTemplate template = ScheduleTemplate.builder()
                .doctor(doctor)
                .startTime(scheduleTemplateDTO.getStartTime())
                .endTime(scheduleTemplateDTO.getEndTime())
                .durationMinutes(scheduleTemplateDTO.getDurationMinutes())
                .maxPatients(scheduleTemplateDTO.getMaxPatients())
                .isActive(true)
                .build();
        scheduleTemplateRepository.save(template);
    }

    // sinh lịch tự động


    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoGenerateSchedules(){

        LocalDate targetDate = LocalDate.now().plusDays(7);
        List<ScheduleTemplate> templates = scheduleTemplateRepository.findByIsActiveTrue();

        for (ScheduleTemplate template : templates){
            generateSlotsFromTemplate(template, targetDate);

        }
        System.out.println("Đã tự động tạo lịch cho ngày: " + targetDate);

    }

    private void generateSlotsFromTemplate(ScheduleTemplate temp, LocalDate date){
        Clinic clinic = temp.getDoctor().getClinic();

        if(clinic == null){
            return;
        }

        LocalTime runner = temp.getStartTime();

        while (runner.plusMinutes(temp.getDurationMinutes()).isBefore(temp.getEndTime()) ||
               runner.plusMinutes(temp.getDurationMinutes()).equals(temp.getEndTime())
        ){
            LocalTime slotEnd = runner.plusMinutes(temp.getDurationMinutes());
            String timeSlot = runner +"_"+ slotEnd;

            if(!scheduleRepository.existsByDoctorIdAndDateAndTimeSlot(temp.getDoctor().getId(), date, timeSlot)){
                Schedule s = Schedule.builder()
                        .doctor(temp.getDoctor())
                        .clinic(clinic)
                        .date(date)
                        .timeSlot(timeSlot)
                        .maxPatients(temp.getMaxPatients())
                        .currentPatients(0)
                        .isActive(true)

                        .build();
                scheduleRepository.save(s);
            }
            runner = slotEnd;
        }
    }





}
