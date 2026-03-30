package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.iservices.INotificationService;
import com.nguyenhuyhoan.hospital.models.Appointment;
import com.nguyenhuyhoan.hospital.models.Notification;
import com.nguyenhuyhoan.hospital.repositoris.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor

public class AppointmentScheduler {
    private final AppointmentRepository appointmentRepository;
    private final INotificationService notificationService;

    // nhắc nhở ngày khám
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyAppointmentReminders(){
        LocalDate today = LocalDate.now();

        List<Appointment> upcomingAppointments = appointmentRepository.findAllByStatus(Appointment.Status.PENDING);

        for(Appointment app: upcomingAppointments){
            LocalDate appointmentDate = app.getSchedule().getDate();

            // tính số ngaày còn lại

            long daysLeft = ChronoUnit.DAYS.between(today, appointmentDate);

            if(daysLeft > 0 && daysLeft <= 3){
                String title = "Nhắc hẹn: Còn "+ daysLeft + "ngày nữa";
                String message = String.format(
                        "Chào %s, bạn có lịch khám với bác sĩ %s vào ngày %s (còn %d ngày). Vui lòng sắp xếp thời gian nhé!",
                        app.getPatient().getFullName(),
                        app.getDoctor().getUser().getFullName(),
                        appointmentDate.toString(),
                        daysLeft
                );

                notificationService.sendNotification(

                        app.getPatient().getId(),
                        title,
                        message,
                        Notification.Type.REMINDER
                );
            } else if(daysLeft == 0){
                //nhắc đến ngày khám
                notificationService.sendNotification(
                        app.getPatient().getId(),
                        "Hôm nay bạn có lịch khám!",
                        "Nhắc nhở: Lịch khám của bạn diễn ra vào hôm nay lúc " + app.getSchedule().getTimeSlot(),
                        Notification.Type.REMINDER
                );
            }

        }

    }
}
