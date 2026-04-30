package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.MedicineDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.MedicineResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IMedicineService;
import com.nguyenhuyhoan.hospital.models.Medicine;
import com.nguyenhuyhoan.hospital.models.Specialty;
import com.nguyenhuyhoan.hospital.repositoris.MedicineRepository;
import com.nguyenhuyhoan.hospital.repositoris.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class MedicineService implements IMedicineService {

    private final MedicineRepository medicineRepository;
    private final SpecialtyRepository specialtyRepository;


    @Override
    @Transactional
    public MedicineResponse create(MedicineDTO medicineDTO) throws DataNotFoundException {
        Specialty specialty = specialtyRepository.findById(medicineDTO.getSpecialtyId())
                .orElseThrow(()-> new DataNotFoundException("Không thấy chuyên khoa"));

        Medicine medicine = Medicine.builder()
                .name(medicineDTO.getName())
                .unit(medicineDTO.getUnit())
                .price(medicineDTO.getPrice())
                .dosageInstruction(medicineDTO.getDosageInstruction())
                .specialty(specialty)
                .isActive(true)
                .build();
        return mapToResponse(medicineRepository.save(medicine));
    }

    @Override
    @Transactional
    public MedicineResponse update(Long id, MedicineDTO medicineDTO) throws DataNotFoundException {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy thuốc"));
        Specialty specialty = specialtyRepository.findById(medicineDTO.getSpecialtyId())
                .orElseThrow(()-> new DataNotFoundException("Không timg thấy khoa"));
        medicine.setName(medicineDTO.getName());
        medicine.setUnit(medicineDTO.getUnit());
        medicine.setPrice(medicineDTO.getPrice());
        medicine.setDosageInstruction(medicineDTO.getDosageInstruction());
        medicine.setSpecialty(specialty);

        return mapToResponse(medicineRepository.save(medicine));
    }

    @Override
    public void delete(Long id) throws DataNotFoundException{
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy"));
        medicine.setIsActive(false);
        medicineRepository.save(medicine);

    }

    @Override
    public List<MedicineResponse> getBySpecialty(Long specialtyId) {

        return medicineRepository.findBySpecialtyIdAndIsActiveTrue(specialtyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicineResponse getById(Long id) throws DataNotFoundException{

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Không tìm thấy thuốc"));
        return mapToResponse(medicine);
    }

    @Override
    public List<MedicineResponse> getAll() {
        return medicineRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse (Medicine medicine){
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .unit(medicine.getUnit())
                .price(medicine.getPrice())
                .dosageInstruction(medicine.getDosageInstruction())
                .specialtyId(medicine.getSpecialty().getId())
                .specialtyName(medicine.getSpecialty().getName())

                .build();
    }
}
