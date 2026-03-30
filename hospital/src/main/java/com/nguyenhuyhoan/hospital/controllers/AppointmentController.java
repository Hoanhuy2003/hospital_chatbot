package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.AppointmentDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.AppointmentResponse;
import com.nguyenhuyhoan.hospital.iservices.IAppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO){
        try {
            AppointmentResponse response = appointmentService.createAppointment(appointmentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        try {
            AppointmentResponse response = appointmentService.getById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 3. Lấy danh sách cuộc hẹn của một Bệnh nhân (Xem lịch sử khám)
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentResponse> responses = appointmentService.getByPatient(patientId);
        return ResponseEntity.ok(responses);
    }

    // 4. Cập nhật trạng thái cuộc hẹn (Xác nhận, Hủy, Hoàn thành)
    // Ví dụ: PATCH /api/v1/appointments/1/status?status=CANCELLED
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            AppointmentResponse response = appointmentService.updateStatus(id, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

//    @GetMapping("/doctor/{doctorId}")
//    public ResponseEntity<List<AppointmentResponse>> getDoctorSchedule(
//            @PathVariable Long doctorId,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorAndDate(doctorId, date));
//    }
}
