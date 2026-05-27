package com.nguyenhuyhoan.hospital.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppointmentStatusPatchDTO {

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;

    /** Bắt buộc khi bác sĩ / admin đặt trạng thái Hủy (nên có lý do gửi bệnh nhân). */
    private String cancellationReason;
}
