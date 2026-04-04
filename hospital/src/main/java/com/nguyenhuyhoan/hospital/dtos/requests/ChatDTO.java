package com.nguyenhuyhoan.hospital.dtos.requests;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatDTO {
    private Long userId;   // ID của người dùng (lấy từ bảng users)
    private String message;
}
