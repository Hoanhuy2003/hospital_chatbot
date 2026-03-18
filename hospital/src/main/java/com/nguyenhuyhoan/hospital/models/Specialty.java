package com.nguyenhuyhoan.hospital.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "specialties")// khoa
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Specialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "icon_url", length = 100)
    private String iconUrl;


}
