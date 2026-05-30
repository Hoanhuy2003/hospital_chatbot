package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsImpl;
import com.nguyenhuyhoan.hospital.services.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/medical_records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final IMedicalRecordService medicalRecordService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(medicalRecordService.getAll(keyword, date));
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> createMedical(@Valid @RequestBody MedicalRecordDTO medicalRecordDTO) {
        try {
            MedicalRecordResponse response = medicalRecordService.createMedicalRecord(medicalRecordDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<MedicalRecordResponse>> getHistory(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetailsImpl principal) {
        medicalRecordService.assertCanAccessPatientRecords(principal, patientId);
        return ResponseEntity.ok(medicalRecordService.getPatientHistory(patientId));
    }

    @GetMapping("/patient/{patientId}/follow-ups")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<?> getPatientFollowUps(
            @PathVariable Long patientId,
            @AuthenticationPrincipal UserDetailsImpl principal) {
        medicalRecordService.assertCanAccessPatientRecords(principal, patientId);
        return ResponseEntity.ok(medicalRecordService.getFollowUpsByPatient(patientId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDetail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(medicalRecordService.getDetail(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/upload-photo")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadMedicalImage(file);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể upload ảnh: " + e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> getPatientsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(medicalRecordService.getPatientsByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> getRecordsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(medicalRecordService.getRecordByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/next-appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> getNextAppointments(
            @PathVariable Long doctorId,
            @AuthenticationPrincipal UserDetailsImpl principal) {
        medicalRecordService.assertDoctorOwnsFollowUpList(principal, doctorId);
        return ResponseEntity.ok(medicalRecordService.getNextAppointments(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getByAppointment(@PathVariable Long appointmentId) {
        try {
            return ResponseEntity.ok(medicalRecordService.getByAppointment(appointmentId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
