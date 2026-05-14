package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.DoctorScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleTemplateDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.GroupedScheduleResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleTemplateResponse;
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
import java.util.ArrayList;
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

        if (doctor.getClinic() == null) {
            throw new DataNotFoundException("Bác sĩ chưa được gán phòng khám, vui lòng liên hệ admin");
        }

        if (!doctor.getClinic().getId().equals(clinic.getId())) {
            throw new DataNotFoundException("Bác sĩ không thuộc phòng khám này");
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
                    .doctorName(s.getDoctor().getUser().getFullName())
                    .timeSlot(s.getTimeSlot())
                    .date(s.getDate())
                    .maxPatients(s.getMaxPatients())
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

        LocalDate targetDate = LocalDate.now().plusDays(0);
        List<ScheduleTemplate> templates = scheduleTemplateRepository.findByIsActiveTrue();

        for (ScheduleTemplate template : templates){
            generateSlotsFromTemplate(template, targetDate);

        }
        System.out.println("Đã tự động tạo lịch cho ngày: " + targetDate);

    }

    @Override
    public List<ScheduleResponse> getSchedulesBySpecialty(Long specialtyId, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findSchedulesBySpecialtyAndDate(specialtyId, date);
        return schedules.stream()
                .map(schedule -> {
                    ScheduleResponse scheduleResponse = ScheduleResponse.fromSchedule(schedule);
                    scheduleResponse.setDoctorName(schedule.getDoctor().getUser().getFullName());
                    scheduleResponse.setClinicName(schedule.getClinic().getName());
                    scheduleResponse.setSpecialtyName(schedule.getClinic().getSpecialty().getName());
                    return scheduleResponse;

                })
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupedScheduleResponse> getSchedule(Long doctorId, LocalDate date) {
        List<Schedule> schedules = scheduleRepository.findByDoctorIdAndDateOrderByTimeSlotAsc(doctorId, date);

        List<GroupedScheduleResponse.ScheduleItem> morning = new ArrayList<>();
        List<GroupedScheduleResponse.ScheduleItem> afternoon = new ArrayList<>();

        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();

        for (Schedule s : schedules) {
            String startTimeStr = s.getTimeSlot().split("_")[0];
            LocalTime slotStart = LocalTime.parse(startTimeStr);

            String status = "AVAILABLE";
            boolean isExpired = date.isBefore(today) || (date.equals(today) && slotStart.isBefore(now));

            if (isExpired) status = "EXPIRED";
            else if (s.getCurrentPatients() >= s.getMaxPatients()) status = "FULL";
            else if (!s.getIsActive()) status = "LOCKED";

            GroupedScheduleResponse.ScheduleItem item = GroupedScheduleResponse.ScheduleItem.builder()
                    .id(s.getId())
                    .time(startTimeStr)
                    .status(status)
                    .build();

            if (slotStart.isBefore(LocalTime.NOON)) {
                morning.add(item);
            } else {
                afternoon.add(item);
            }
        }

        // Sửa ở đây: Trả về List thay vì 1 object
        GroupedScheduleResponse grouped = GroupedScheduleResponse.builder()
                .morning(morning)
                .afternoon(afternoon)
                .build();

        return List.of(grouped);        // ← Sửa ở đây
    }

    @Override
    public List<ScheduleTemplate> getTemplateByDoctorId(Long doctorId) {
        return scheduleTemplateRepository.findByDoctorId(doctorId);
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


    public ScheduleTemplateResponse toResponse(ScheduleTemplate template) {
        List<String> morning = new ArrayList<>();
        List<String> afternoon = new ArrayList<>();

        LocalTime runner = template.getStartTime();
        LocalTime end = template.getEndTime();
        int duration = template.getDurationMinutes();

        while (runner.plusMinutes(duration).isBefore(end) || runner.plusMinutes(duration).equals(end)) {
            String timeLabel = runner.toString().substring(0, 5); // Lấy "08:00"
            if (runner.isBefore(LocalTime.NOON)) {
                morning.add(timeLabel);
            } else {
                afternoon.add(timeLabel);
            }
            runner = runner.plusMinutes(duration);
        }

        return ScheduleTemplateResponse.builder()
                .id(template.getId())
                .doctorId(template.getDoctor().getId())
                .startTime(template.getStartTime().toString())
                .endTime(template.getEndTime().toString())
                .durationMinutes(duration)
                .morningSlots(morning)
                .afternoonSlots(afternoon)
                .build();
    }

    @Override
    public DoctorScheduleDTO getAvailableTimeSlotsByDoctor(Long doctorId, LocalDate date) {
        // 1. Lấy danh sách lịch từ Repository
        List<Schedule> schedules = scheduleRepository.findByDoctorIdAndDate(doctorId, date);

        // 2. Lọc các slot thỏa mãn điều kiện
        List<String> timeSlots = schedules.stream()
                .filter(s ->
                        // Kiểm tra slot có đang mở không
                        Boolean.TRUE.equals(s.getIsActive()) &&
                                // Kiểm tra xem đã đầy người đặt chưa (nếu maxPatients là null thì coi như vô hạn)
                                (s.getMaxPatients() == null || s.getCurrentPatients() < s.getMaxPatients())
                )
                .map(Schedule::getTimeSlot) // Lấy chuỗi "08:00_08:30"
                .sorted()
                .collect(Collectors.toList());

        // 3. Trả về DTO
        return DoctorScheduleDTO.builder()
                .doctorId(doctorId)
                .date(date)
                .availableTimeSlots(timeSlots)
                .build();
    }


    // ĐẶT LỊCH THEO KHOA






}
