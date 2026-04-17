package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.SpecialtyResponse;
import com.nguyenhuyhoan.hospital.iservices.ISpecialtyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/v1/specialty")
@RequiredArgsConstructor
public class SpecialtyController {

    private final ISpecialtyService specialtyService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SpecialtyResponse> create(@Valid @ModelAttribute SpecialtyDTO dto) throws IOException{
//     kiểm tra
//        System.out.println("DEBUG Controller: Nhận request tạo Specialty");
//        System.out.println("DEBUG Name: " + dto.getName());
//
//        if (dto.getIconUrl() == null) {
//            System.out.println("DEBUG Error: File iconUrl gửi từ Postman bị NULL!");
//        } else {
//            System.out.println("DEBUG Success: Đã nhận file: " + dto.getIconUrl().getOriginalFilename());
//            System.out.println("DEBUG Size: " + dto.getIconUrl().getSize());
//        }
            return ResponseEntity.ok(specialtyService.createSpecialty(dto));

    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<SpecialtyResponse>> getAll(){
        return ResponseEntity.ok(specialtyService.getAll());
    }


    @GetMapping("/images/{imageName}")
    public ResponseEntity<?> viewImage(@PathVariable String imageName) {
        try {
            // Hoàn kiểm tra kỹ xem folder trên máy có đúng là D:/hospital/hospital/uploads/specialties không
            java.nio.file.Path imagePath = Paths.get("D:/hospital/uploads/specialties").resolve(imageName);

            UrlResource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG) // Nếu là ảnh PNG
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SpecialtyResponse> updateSpecialty(@PathVariable Long id, @ModelAttribute SpecialtyDTO specialtyDTO) throws IOException{
        return ResponseEntity.ok(specialtyService.updateSpecialty(id,specialtyDTO));

    }
}
