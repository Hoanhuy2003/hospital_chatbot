package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicalRecordDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicalRecordResponse;
import com.nguyenhuyhoan.hospital.iservices.IMedicalRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medical_records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final IMedicalRecordService medicalRecordService;

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
}
