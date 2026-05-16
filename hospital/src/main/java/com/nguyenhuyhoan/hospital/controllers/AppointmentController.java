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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO){
        try {
            AppointmentResponse response = appointmentService.createAppointment(appointmentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
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
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentResponse> responses = appointmentService.getByPatient(patientId);
        return ResponseEntity.ok(responses);
    }

    // 4. Cập nhật trạng thái cuộc hẹn (Xác nhận, Hủy, Hoàn thành)
    // Ví dụ: PATCH /api/v1/appointments/1/status?status=CANCELLED
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
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

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<AppointmentResponse> appointments = appointmentService.getByDoctor(doctorId);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAppointment(){
        try {
            List<AppointmentResponse> appointments = appointmentService.getAllAppointment();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " +e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    // Đảm bảo chỉ có người dùng có vai trò PATIENT (Bệnh nhân) mới gọi được API này
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable("id") Long id,
            @RequestParam("userId") Long userId
    ) {
        try {
            // Gọi service xử lý logic: check 1h, check status, check owner
            appointmentService.cancelAppointment(id, userId);

            return ResponseEntity.ok(Map.of(
                    "message", "Hủy lịch khám thành công",
                    "status", "CANCELLED"
            ));
        } catch (Exception e) {
            // Trả về lỗi 400 kèm thông báo cụ thể (ví dụ: "Bác sĩ đã xác nhận không thể hủy")
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }



//    @GetMapping("/doctor/{doctorId}")
//    public ResponseEntity<List<AppointmentResponse>> getDoctorSchedule(
//            @PathVariable Long doctorId,
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
//        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorAndDate(doctorId, date));
//    }
}
