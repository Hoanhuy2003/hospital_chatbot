package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.ScheduleTemplateDTO;
import com.nguyenhuyhoan.hospital.iservices.IScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/schedule-templates")
@RequiredArgsConstructor
public class ScheduleTemplateController {
    private final IScheduleService scheduleService;

    @PostMapping("")
    public ResponseEntity<?> createTemplate(@Valid @RequestBody ScheduleTemplateDTO templateDTO) {
        try {
            scheduleService.createScheduleTemplate(templateDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Thiết lập lịch mẫu thành công! Hệ thống sẽ tự động sinh lịch từ khung giờ này.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo lịch: "+ e.getMessage());
        }
    }

    @PostMapping("/trigger-generate")
    public ResponseEntity<?> triggerAutoGenerate(){
        try {
            scheduleService.autoGenerateSchedules();
            return ResponseEntity.ok("Đã kích hoạt tạo lịch thực tế dựa trên các Template thành công!");
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi hệ thống khi sinh lịch: "+ e.getMessage());
        }
    }
}
