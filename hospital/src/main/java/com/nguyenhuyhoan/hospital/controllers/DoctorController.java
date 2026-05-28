package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.DoctorDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.DoctorResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.DoctorSelfProfileResponse;
import com.nguyenhuyhoan.hospital.iservices.IDoctorService;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final IDoctorService doctorService;

        @PostMapping(value = "/promote", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> createDoctor(@Valid @ModelAttribute DoctorDTO doctorDTO) {
            try {

                if(doctorDTO.getPhotoUrl() == null || doctorDTO.getPhotoUrl().isEmpty()){
                    return ResponseEntity.badRequest().body("Vui lòng upload ảnh chân dung bác sĩ");
                }


                DoctorResponse doctorResponse = doctorService.createDoctor(doctorDTO);
                return ResponseEntity.status(HttpStatus.CREATED).body(doctorResponse);

            } catch (IOException e){
                return ResponseEntity.internalServerError().body("Lỗi hệ thống khi lưu file: " + e.getMessage());
            } catch (Exception e){
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }


    @GetMapping("")
    public ResponseEntity<?> getAllDoctor(@RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) Long specialtyId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "12")int size){
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(doctorService.getAllDoctors(keyword, specialtyId, pageRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id){
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @ModelAttribute DoctorDTO doctorDTO) throws IOException{
        return ResponseEntity.ok(doctorService.updateDoctor(id, doctorDTO));
    }

    @PatchMapping("/assign-to-clinic/{clinicId}")
    public ResponseEntity<?> assignDoctor(@PathVariable Long clinicId,
                                          @RequestBody List<Long> doctorIds){
        doctorService.assignDoctorsToClinic(clinicId, doctorIds);
        return ResponseEntity.ok("Gán bác sỹ thành công");
    }

    @PutMapping("/clinic/{id}")
    public ResponseEntity<?> changeClinic(@PathVariable Long id, @RequestParam Long clinicId){
        return ResponseEntity.ok(doctorService.updateDoctorClinic(id, clinicId));
    }

    @GetMapping("/clinic/{clinicId}")
    public ResponseEntity<List<DoctorResponse>> getDoctorByClinic(@PathVariable Long clinicId){
        List<DoctorResponse> doctorResponses = doctorService.getDoctorByClinic(clinicId);
        return ResponseEntity.ok(doctorResponses);
    }
}