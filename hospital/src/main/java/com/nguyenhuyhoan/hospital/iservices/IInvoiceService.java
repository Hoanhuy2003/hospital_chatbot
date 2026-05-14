package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.InvoiceDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceDetailResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceResponse;

public interface IInvoiceService {
    InvoiceResponse createInvoice(InvoiceDTO invoiceDTO);

    InvoiceDetailResponse getInvoice(Long invoiceId);


    InvoiceDetailResponse getByMedicalRecord(Long medicalId);

    void markAsPaid(Long invoiceId, String transactionId);
}
