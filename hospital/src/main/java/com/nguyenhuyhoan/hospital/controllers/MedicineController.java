package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicineDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicineResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IMedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final IMedicineService medicineService;

    @GetMapping("/specialty/{specialtyId}")
    public ResponseEntity<?> getBySpecialty(@PathVariable Long specialtyId){
        return ResponseEntity.ok(medicineService.getBySpecialty(specialtyId));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody MedicineDTO medicineDTO){
        try{
            return ResponseEntity.ok(medicineService.create(medicineDTO));
        }catch (DataNotFoundException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody MedicineDTO medicineDTO){
        try {
            return ResponseEntity.ok(medicineService.update(id, medicineDTO));
        } catch (DataNotFoundException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(medicineService.getById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getAll() {
        List<MedicineResponse> medicines = medicineService.getAll();
        return ResponseEntity.ok(medicines);
    }
}
