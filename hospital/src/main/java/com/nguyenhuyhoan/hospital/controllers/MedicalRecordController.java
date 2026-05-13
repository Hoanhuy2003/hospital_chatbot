package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import com.nguyenhuyhoan.hospital.services.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medical_records")
@RequiredArgsConstructor
//@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public class MedicalRecordController {

    private final IMedicalRecordService medicalRecordService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("")
    public ResponseEntity<?> createMedical(@Valid @RequestBody MedicalRecordDTO medicalRecordDTO){
        try {
            MedicalRecordResponse response = medicalRecordService.createMedicalRecord(medicalRecordDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e){
            return ResponseEntity.badRequest().body("Không tạo được");
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecordResponse>> getHistory(@PathVariable Long patientId){
        return ResponseEntity.ok(medicalRecordService.getPatientHistory(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Long id){
        try {
            return ResponseEntity.ok(medicalRecordService.getDetail(id));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file")MultipartFile file){
        try {
            String url = cloudinaryService.uploadMedicalImage(file);
            return ResponseEntity.ok(url);
        }catch (Exception e){
            return ResponseEntity.badRequest().body("Không thể upload ảnh: " + e.getMessage());
        }
    }

    @GetMapping("/doctor/{doctorId}/patients")
    public ResponseEntity<?> getPatientsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(medicalRecordService.getPatientsByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getRecordsByDoctor(@PathVariable Long doctorId){
        return ResponseEntity.ok(medicalRecordService.getRecordByDoctor(doctorId));
    }
    @GetMapping("/doctor/{doctorId}/next-appointments")
    public ResponseEntity<?> getNextAppointments(@PathVariable Long doctorId){
        return ResponseEntity.ok(medicalRecordService.getNextAppointments(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(@PathVariable Long appointmentId){
        return ResponseEntity.ok(medicalRecordService.getByAppointment(appointmentId));
    }

}
