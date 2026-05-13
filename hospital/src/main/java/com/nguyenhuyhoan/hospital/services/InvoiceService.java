package com.nguyenhuyhoan.hospital.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nguyenhuyhoan.hospital.dtos.requests.InvoiceDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.MedicineDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.PrescriptionJSON;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceDetailResponse;
import com.nguyenhuyhoan.hospital.dtos.responses.InvoiceResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IInvoiceService;
import com.nguyenhuyhoan.hospital.models.Invoice;
import com.nguyenhuyhoan.hospital.models.MedicalRecord;
import com.nguyenhuyhoan.hospital.models.Medicine;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.InvoiceRepository;
import com.nguyenhuyhoan.hospital.repositoris.MedicalRecordRepository;
import com.nguyenhuyhoan.hospital.repositoris.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService implements IInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicineRepository medicineRepository;
    private final ObjectMapper objectMapper; // Phải dùng com.fasterxml.jackson

    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceDTO invoiceDTO) {
        MedicalRecord medicalRecord = medicalRecordRepository.findById(invoiceDTO.getMedicalRecordId())
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy bệnh án"));

        User patient = medicalRecord.getAppointment().getPatient();
        double examFee = medicalRecord.getAppointment().getDoctor().getPrice();

        // 1. Dùng hàm parsePrescription để lấy danh sách thuốc và tính tiền
        List<InvoiceDetailResponse.MedicineLineItem> lineItems = parsePrescription(medicalRecord.getPrescription());

        double medicineTotal = lineItems.stream()
                .mapToDouble(item -> item.getSubTotal() != null ? item.getSubTotal() : 0.0)
                .sum();

        double totalAmount = examFee + medicineTotal;
        double discount = 0;
        boolean hasInsurance = false;

        // 2. Tính toán bảo hiểm
        if (patient.getHealthInsuranceNumber() != null && !patient.getHealthInsuranceNumber().isEmpty()) {
            hasInsurance = true;
            double benefit = (patient.getInsuranceBenefitLevel() != null)
                    ? patient.getInsuranceBenefitLevel() / 100.0 : 0.8;
            discount = totalAmount * benefit;
        }

        // 3. Builder Invoice để lưu vào DB
        Invoice invoice = Invoice.builder()
                .medicalRecord(medicalRecord)
                .examinationFee(examFee)
                .totalMedicineCost(medicineTotal)
                .totalAmount(totalAmount)
                .hasInsurance(hasInsurance)
                .insuranceDiscount(discount)
                .finalAmount(totalAmount - discount)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(invoiceRepository.save(invoice));
    }

    @Override
    public InvoiceDetailResponse getInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy hóa đơn"));

        MedicalRecord record = invoice.getMedicalRecord();
        List<InvoiceDetailResponse.MedicineLineItem> lineItems = parsePrescription(record.getPrescription());

        return InvoiceDetailResponse.builder()
                .invoiceID(invoice.getId())
                .patientName(record.getPatient().getFullName())
                .healthInsuranceNumber(record.getPatient().getHealthInsuranceNumber())
                .doctorName(record.getDoctor().getUser().getFullName())
                .diagnosis(record.getDiagnosis())
                .createAt(invoice.getCreatedAt())
                .items(lineItems)
                // Lấy trực tiếp từ thực thể Invoice đã lưu trong DB
                .examinationFee(invoice.getExaminationFee())
                .totalMedicineCost(invoice.getTotalMedicineCost())
                .insuranceDiscount(invoice.getInsuranceDiscount())
                .finalAmount(invoice.getFinalAmount())
                .status(invoice.getStatus())
                .build();
    }

    @Override
    public InvoiceDetailResponse getByMedicalRecord(Long medicalId) {

        Invoice invoice = invoiceRepository.findByMedicalRecordId(medicalId)
                .orElseThrow(()-> new DataNotFoundException("Khong tìm thấy hóa đơn"));
        List<InvoiceDetailResponse.MedicineLineItem> lineItems = parsePrescription(invoice.getMedicalRecord().getPrescription());


        return InvoiceDetailResponse.builder()
                .invoiceID(invoice.getId())
                .patientName(invoice.getMedicalRecord().getPatient().getFullName())
                .healthInsuranceNumber(invoice.getMedicalRecord().getPatient().getHealthInsuranceNumber())
                .doctorName(invoice.getMedicalRecord().getDoctor().getUser().getFullName())
                .diagnosis(invoice.getMedicalRecord().getDiagnosis())
                .createAt(invoice.getCreatedAt())
                .items(lineItems)
                .examinationFee(invoice.getExaminationFee())
                .totalMedicineCost(invoice.getTotalMedicineCost())
                .insuranceDiscount(invoice.getInsuranceDiscount())
                .finalAmount(invoice.getFinalAmount())
                .status(invoice.getStatus())
                .build();
    }

    private List<InvoiceDetailResponse.MedicineLineItem> parsePrescription(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            // Parse JSON sang List DTO
            List<PrescriptionJSON> items = objectMapper.readValue(json, new TypeReference<List<PrescriptionJSON>>() {});
            List<InvoiceDetailResponse.MedicineLineItem> lineItems = new ArrayList<>();

            for (PrescriptionJSON item : items) {
                if (item.getMedicineId() == null) continue;

                Medicine med = medicineRepository.findById(item.getMedicineId()).orElse(null);
                if (med != null) {
                    MedicineDTO dto = MedicineDTO.builder()
                            .name(med.getName())
                            .unit(med.getUnit())
                            .price(med.getPrice())
                            .dosageInstruction(item.getNote())
                            .build();

                    lineItems.add(InvoiceDetailResponse.MedicineLineItem.builder()
                            .medicine(dto)
                            .quantity(item.getQuantity())
                            .subTotal(med.getPrice() * item.getQuantity())
                            .build());
                }
            }
            return lineItems;
        } catch (Exception e) {
            // Log lỗi ra console để debug nếu cần
            System.out.println("Lỗi parse đơn thuốc: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .medicalRecordId(invoice.getMedicalRecord().getId())
                .patientName(invoice.getMedicalRecord().getPatient().getFullName())
                .totalAmount(invoice.getTotalAmount())
                .insuranceDiscount(invoice.getInsuranceDiscount())
                .finalAmount(invoice.getFinalAmount())
                .status(invoice.getStatus())
                .createAt(invoice.getCreatedAt())
                .build();
    }
}