package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.SpecialtyDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.SpecialtyResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.ISpecialtyService;
import com.nguyenhuyhoan.hospital.models.Specialty;
import com.nguyenhuyhoan.hospital.repositoris.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpecialtyService implements ISpecialtyService {

    private final SpecialtyRepository specialtyRepository;
    private final FileService fileService;
    private final CloudinaryService cloudinaryService;




//    @Value("${file.specialty-dir}")
//    private String subDir;



    @Override
    public SpecialtyResponse createSpecialty(SpecialtyDTO specialtyDTO) throws IOException {

        String iconUrl = cloudinaryService.uploadDoctorImage(specialtyDTO.getIconUrl());



        Specialty specialty = Specialty.builder()
                .name(specialtyDTO.getName())
                .description(specialtyDTO.getDescription())
                .iconUrl(iconUrl)
                .isActive(true)
                .build();
        Specialty save = specialtyRepository.save(specialty);

        return mapToResponse(save);



    }

    @Override
    public List<SpecialtyResponse> getAll() {

        return specialtyRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public SpecialtyResponse updateSpecialty(Long id, SpecialtyDTO specialtyDTO) throws IOException {

        Specialty existingSpecialty = specialtyRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Khong tim thay"));

        if(specialtyDTO.getIconUrl() != null && !specialtyDTO.getIconUrl().isEmpty()){
            String newIconUrl = cloudinaryService.uploadDoctorImage(specialtyDTO.getIconUrl());
            existingSpecialty.setIconUrl(newIconUrl);
        }

        existingSpecialty.setName(specialtyDTO.getName());
        existingSpecialty.setDescription(specialtyDTO.getDescription());
        existingSpecialty.setIsActive(specialtyDTO.getIsActive());

        Specialty save = specialtyRepository.save(existingSpecialty);



        return mapToResponse(save);
    }


    private SpecialtyResponse mapToResponse(Specialty s) {
        return SpecialtyResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .iconUrl(s.getIconUrl())
                .isActive(s.getIsActive())
                .build();
    }
}
