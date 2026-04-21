package com.nguyenhuyhoan.hospital.dtos.responses;

import lombok.*;
import java.util.List;


@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GroupedScheduleResponse {
    private List<ScheduleItem> morning;
    private List<ScheduleItem> afternoon;

    @Data
    @Builder
    public static class ScheduleItem {
        private Long id;
        private String time;   // Ví dụ: "08:00"
        private String status; // "AVAILABLE", "FULL", "EXPIRED"
    }
}