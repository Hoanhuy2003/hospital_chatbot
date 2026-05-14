package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.InvoiceDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceDetailResponse;
import com.nguyenhuyhoan.hospital.iservices.IInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final IInvoiceService invoiceService;

    // Admin: danh sách tất cả hóa đơn có lọc
    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        return ResponseEntity.ok(invoiceService.getAll(keyword, status, dateFrom, dateTo));
    }

    // Admin: thống kê nhanh
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(invoiceService.getStats());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceDTO recordId) {
        return ResponseEntity.ok(invoiceService.createInvoice(recordId));
    }

    // Lấy chi tiết để hiển thị/in ở Front-end
    @GetMapping("/{id}")
    public ResponseEntity<?> getInvoice(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(invoiceService.getInvoice(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/medical_record/{medicalRecordId}")
    public ResponseEntity<?> getByMedicalRecord(@PathVariable Long medicalRecordId) {
        try {
            return ResponseEntity.ok(invoiceService.getByMedicalRecord(medicalRecordId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
