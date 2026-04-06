package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.HotlineDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.HotlineResponse;
import com.nguyenhuyhoan.hospital.services.HospitalHotlineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hotlines")
@RequiredArgsConstructor
public class HotlineController {

    private final HospitalHotlineService hospitalHotlineService;

    @GetMapping("/public")
    public ResponseEntity<List<HotlineResponse>> getHotlines() {
        return ResponseEntity.ok(hospitalHotlineService.getAllGeneralHotlines());
    }

    // API dành cho Admin thêm mới Hotline
    @PostMapping("/admin")
    // @PreAuthorize("hasRole('ADMIN')") // Mở ra nếu Hoàn đã làm phần Role
    public ResponseEntity<HotlineResponse> addHotline(@RequestBody HotlineDTO request) {
        HotlineResponse response = hospitalHotlineService.createHotline(request);
        return ResponseEntity.ok(response);
    }
}
