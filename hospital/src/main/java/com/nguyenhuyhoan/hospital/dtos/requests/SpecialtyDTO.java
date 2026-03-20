package com.nguyenhuyhoan.hospital.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpecialtyDTO {


    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("is_active")
    private Boolean isActive;


    private MultipartFile iconUrl;

    public void setIcon_url(MultipartFile icon_url) {
        this.iconUrl = icon_url;
    }
}
