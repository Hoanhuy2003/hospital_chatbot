package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.AppointmentDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.AppointmentResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IAppointmentService;
import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.Notification;
import com.nguyenhuyhoan.hospital.models.Schedule;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import com.nguyenhuyhoan.hospital.repositoris.ScheduleRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService implements IAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    private final INotificationService notificationService;


    @Override
    public AppointmentResponse createAppointment(AppointmentDTO appointmentDTO) throws DataNotFoundException {

        Schedule schedule = scheduleRepository.findById(appointmentDTO.getScheduleId())
                .orElseThrow(()-> new DataNotFoundException("Không co lịch khám này"));

//        Schedule schedule1 = scheduleRepository.findByDoctorIdAndDateAndTimeSlot(
//                appointmentDTO.getDoctorId(),
//                appointmentDTO.getAppointmentTime().toLocalDate(),
//        )

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Kiểm tra ngày
        if (schedule.getDate().isBefore(today)) {
            throw new RuntimeException("Không thể đặt lịch cho ngày trong quá khứ!");
        }

        // kiểm tra chỗ trôngs
        if(schedule.getCurrentPatients() >= schedule.getMaxPatients()){
            throw new DataNotFoundException("Khung giờ này đã được đặt hết rồi!!!");

        }

        User patient = userRepository.findById(appointmentDTO.getPatientId())
                .orElseThrow(()-> new DataNotFoundException("Khoong tồn tại bệnh nhân"));

        LocalDateTime appointmentTime;
        try {
            String startTimeStr = schedule.getTimeSlot().split("_")[0].trim();
            LocalTime startTime = LocalTime.parse(startTimeStr);
            appointmentTime = schedule.getDate().atTime(startTime);
        } catch (Exception e){
            appointmentTime = schedule.getDate().atStartOfDay();
        }

        int nextQueueNumber = schedule.getCurrentPatients() + 1;

        Appointment appointment = Appointment.builder()
                .name(appointmentDTO.getName())
                .patient(patient)
                .schedule(schedule)
                .doctor(schedule.getDoctor())
                .clinic(schedule.getClinic())
                .appointmentTime(appointmentTime)
                .reason(appointmentDTO.getReason())
                .type(Appointment.Type.valueOf(appointmentDTO.getType()))
                .status(Appointment.Status.PENDING)
                .queueNumber("QN-" + schedule.getId() + "_"+ (schedule.getCurrentPatients() + 1))

                .build();

        Appointment saveAppointment = appointmentRepository.save(appointment);



        schedule.setCurrentPatients(nextQueueNumber);
        scheduleRepository.save(schedule);

        try {
            String message = String.format(
                    "Chào %s, bạn đã đặt lịch thành công với bác sĩ %s vào lúc %s ngày %s. Số thứ tự của bạn là: %d.",
                    patient.getFullName(),
                    schedule.getDoctor().getUser().getFullName(),
                    schedule.getTimeSlot(),
                    schedule.getDate(),
                    nextQueueNumber


            );
            notificationService.sendNotification(
                    patient.getId(),
                    "Đặt lịch khám thành công",
                    message,
                    Notification.Type.APPOINTMENT_CONFIRMED
            );

        } catch (Exception e) {
            System.err.println("Lỗi gửi thông báo: " + e.getMessage());
        }

        try{
            Long doctorId = schedule.getDoctor().getUser().getId();
            String doctorMsg = String.format(
                    "Bác sĩ có lịch hẹn mới! Bệnh nhân %s đã đặt lịch khám vào lúc %s ngày %s.",
                    patient.getFullName(),
                    schedule.getTimeSlot().replace("_", " - "),
                    schedule.getDate()
            );
            notificationService.sendNotification(
                    doctorId,
                    "Lịch hẹn mơi",
                    doctorMsg,
                    Notification.Type.SYSTEM
            );
        } catch (Exception e) {
            System.err.println("Lỗi gửi thông báo BS: " + e.getMessage());
        }


        return AppointmentResponse.fromAppointment(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) throws DataNotFoundException {


        return appointmentRepository.findByIdWithDetails(id)
                .map(AppointmentResponse:: fromAppointment)
                .orElseThrow(()-> new DataNotFoundException("lỗi rồi nhé"));

    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getByPatient(Long patientId) {


        return appointmentRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(AppointmentResponse::fromAppointment)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long id, String status, String cancellationReason) throws DataNotFoundException {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tồn tại cuộc hẹn này"));

        Appointment.Status newStatus = Appointment.Status.valueOf(status.toUpperCase());
        Appointment.Status oldStatus = appointment.getStatus();

        if (newStatus == Appointment.Status.CANCELLED && oldStatus != Appointment.Status.CANCELLED) {
            String trimmed = cancellationReason != null ? cancellationReason.trim() : "";
            if (trimmed.isEmpty()) {
                throw new RuntimeException("Vui lòng nhập lý do hủy lịch để gửi tới bệnh nhân.");
            }
            if (trimmed.length() > 1000) {
                trimmed = trimmed.substring(0, 1000);
            }
            appointment.setCancellationReason(trimmed);
        }

        if (newStatus == Appointment.Status.CONFIRMED) {
            appointment.setCancellationReason(null);
        }

        // Hủy lịch trả lại slot
        if(newStatus == Appointment.Status.CANCELLED && oldStatus != Appointment.Status.CANCELLED){
            Schedule schedule = appointment.getSchedule();
            if(schedule.getCurrentPatients() > 0){
                schedule.setCurrentPatients(schedule.getCurrentPatients() - 1);
                scheduleRepository.save(schedule);
            }
        }

        appointment.setStatus(newStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // THÔNG BÁO KẾT QUẢ XỬ LÝ CHO BỆNH NHÂN
        try {
            String title = "Cập nhật trạng thái lịch khám";
            String message = "";
            if(newStatus == Appointment.Status.CONFIRMED) {
                message = "Lịch khám của bạn đã được bác sĩ xác nhận. Hãy đến đúng giờ nhé!";
            } else if(newStatus == Appointment.Status.CANCELLED) {
                String reasonTxt = appointment.getCancellationReason() != null
                        ? appointment.getCancellationReason()
                        : "";
                message = "Rất tiếc, lịch khám của bạn đã bị hủy. Vui lòng đặt lịch khác."
                        + (reasonTxt.isEmpty() ? "" : " Lý do: " + reasonTxt);
            }

            if(!message.isEmpty()){
                notificationService.sendNotification(
                        appointment.getPatient().getId(),
                        title,
                        message,
                        Notification.Type.SYSTEM
                );
            }
        } catch (Exception e) {
            System.err.println("Lỗi gửi thông báo cập nhật: " + e.getMessage());
        }

        return AppointmentResponse.fromAppointment(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorUserId(doctorId)
                .stream()
                .map(AppointmentResponse::fromAppointment)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAllAppointment() {
        return appointmentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AppointmentResponse::fromAppointment)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelAppointment(Long id, Long userId) throws Exception {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không có lịch hẹn nào"));
        if(!appointment.getPatient().getId().equals(userId)){
            throw  new Exception("Bạn không có quyền hủy lịch khám");

        }
        if("CONFIRMED".equalsIgnoreCase(appointment.getStatus().toString())){
            throw new Exception("Bác sĩ đã xác nhận lịch khám, bạn không thể tự hủy.");
        }
        if ("CANCELLED".equalsIgnoreCase(appointment.getStatus().toString())) {
            throw new Exception("Lịch hẹn này đã được hủy trước đó.");
        }

        String timeSlot = appointment.getSchedule().getTimeSlot(); // Ví dụ: "08:00_09:00"
        String startTimeStr = timeSlot.split("_")[0]; // Lấy "08:00"

        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getSchedule().getDate(), startTime);
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(appointmentDateTime.minusHours(1))) {
            throw new Exception("Bạn chỉ có thể hủy lịch trước giờ khám ít nhất 1 tiếng.");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);


        Schedule schedule = appointment.getSchedule();
        if(schedule != null){
            if(schedule.getCurrentPatients() > 0){
                schedule.setCurrentPatients(schedule.getCurrentPatients() - 1);
                scheduleRepository.save(schedule);
            }
        }
    }
//    @Override
//    public List<AppointmentResponse> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
//        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndDate(doctorId, date);
//
//        return appointments.stream()
//                .map(AppointmentResponse::fromAppointment)
//                .collect(Collectors.toList());
//    }
//
//    public boolean isOwner(Long appointmentId, Long userId) {
//        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
//        return appointment != null && appointment
//    }


}
