package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.GroupedScheduleResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.ScheduleTemplateResponse;
import com.nguyenhuyhoan.hospital.iservices.IScheduleService;
import com.nguyenhuyhoan.hospital.models.ScheduleTemplate;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor

public class ScheduleController {

    private final IScheduleService scheduleService;

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<?> createSchedules(@Valid @RequestBody ScheduleDTO scheduleDTO) {
        try {
            scheduleService.createSchedules(scheduleDTO);
            return ResponseEntity.ok("Tạo danh sách lịch khám thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ScheduleResponse>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDoctorAndDate(doctorId, date));
    }

    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<ScheduleResponse>> getByClinic(
            @PathVariable Long clinicId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(scheduleService.getSchedulesByClinicAndDate(clinicId, date));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            scheduleService.deleteSchedule(id);
            return ResponseEntity.ok("Đã hủy lịch khám thành công.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<List<ScheduleResponse>> getBySpecialtyId(
            @PathVariable Long specialtyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        List<ScheduleResponse> scheduleResponses = scheduleService.getSchedulesBySpecialty(specialtyId, date);
        return ResponseEntity.ok(scheduleResponses);
    }

    @GetMapping("/doctorsch/{doctorId}")
    public ResponseEntity<List<GroupedScheduleResponse>> getByDoctorch(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date ){
        return ResponseEntity.ok(scheduleService.getSchedule(doctorId, date));
    }

    @GetMapping("/templates/doctor/{doctorId}")
    public ResponseEntity<List<ScheduleTemplateResponse>> getTemplatesByDoctor(@PathVariable Long doctorId) {
        List<ScheduleTemplate> templates = scheduleService.getTemplateByDoctorId(doctorId);

        // Convert danh sách Entity sang danh sách Response
        List<ScheduleTemplateResponse> responses = templates.stream()
                .map(scheduleService::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

}
