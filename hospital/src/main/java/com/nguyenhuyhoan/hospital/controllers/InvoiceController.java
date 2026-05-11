package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.InvoiceDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceDetailResponse;
import com.nguyenhuyhoan.hospital.iservices.IInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final IInvoiceService invoiceService;

    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceDTO recordId) {
        return ResponseEntity.ok(invoiceService.createInvoice(recordId));
    }

    // Lấy chi tiết để hiển thị/in ở Front-end
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDetailResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }
}
