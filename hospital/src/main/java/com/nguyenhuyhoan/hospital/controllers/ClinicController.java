package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ClinicResponse;
import com.nguyenhuyhoan.hospital.iservices.IClinicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final IClinicService clinicService;

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createClinic(@Valid @ModelAttribute ClinicDTO clinicDTO){
        try {
            ClinicResponse clinicResponse = clinicService.createClinic(clinicDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(clinicResponse);

        }catch (Exception e){

            return ResponseEntity.badRequest().body("Không tạo được phòng khám: " + e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<Page<ClinicResponse>> getAllClinics(@RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "100")int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<ClinicResponse> clinicResponses = clinicService.getAllClinics(pageable);

        return ResponseEntity.ok(clinicResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClinicById(@PathVariable Long id){
        try {
            ClinicResponse response = clinicService.getClinicById(id);
            return ResponseEntity.ok(response);
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy: " + e.getMessage());
        }

    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateClinic(@PathVariable Long id, @Valid @ModelAttribute ClinicDTO clinicDTO){
        try {
            ClinicResponse clinicResponse = clinicService.updateClinic(id, clinicDTO);
            return ResponseEntity.ok(clinicResponse);

        } catch (Exception e){
            return ResponseEntity.badRequest().body("Cập nhật thất bại: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleClinicActive(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(clinicService.toggleClinicActive(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không đổi được trạng thái: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteClinic(@PathVariable Long id) {
        try {
            clinicService.deleteClinic(id);
            return ResponseEntity.ok("Đã khóa phòng khám ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa: " + e.getMessage());
        }
    }
    @GetMapping("/statistics")
    public ResponseEntity<?> getClinicStat(){
        return ResponseEntity.ok(clinicService.getClinicStat());
    }

}
