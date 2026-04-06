package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HotlineDTO {
    private String departmentName; // Tên bộ phận: "Cấp cứu", "Hành chính"...
    private String phoneNumber;    // Số điện thoại
    private String description;    // Mô tả thêm
}
