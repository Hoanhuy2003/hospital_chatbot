package com.nguyenhuyhoan.hospital.services;


import com.nguyenhuyhoan.hospital.dtos.requests.HotlineDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.HotlineResponse;
import com.nguyenhuyhoan.hospital.models.HospitalHotline;
import com.nguyenhuyhoan.hospital.repositoris.HospitalHotlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalHotlineService {

    private final HospitalHotlineRepository hotlineRepository;

    public List<HotlineResponse> getAllGeneralHotlines(){
        return hotlineRepository.findByIsActiveTrue().stream()
                .map(h -> HotlineResponse.builder()
                        .departmentName(h.getDepartmentName())
                        .phoneNumber(h.getPhoneNumber())
                        .description(h.getDescription())
                        .build())
                .toList();

    }

    public HotlineResponse createHotline(HotlineDTO request) {
        // 1. Chuyển từ DTO sang Entity
        HospitalHotline hotline = HospitalHotline.builder()
                .departmentName(request.getDepartmentName())
                .phoneNumber(request.getPhoneNumber())
                .description(request.getDescription())
                .isActive(true) // Mặc định là đang hoạt động
                .build();

        // 2. Lưu vào Database
        HospitalHotline savedHotline = hotlineRepository.save(hotline);

        // 3. Trả về Response DTO (để hiển thị kết quả cho Admin)
        return HotlineResponse.builder()
                .departmentName(savedHotline.getDepartmentName())
                .phoneNumber(savedHotline.getPhoneNumber())
                .description(savedHotline.getDescription())
                .build();
    }
}
