package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.ClinicDTO;
import com.nguyenhuyhoan.hospital.dtos.requests.ClinicStatDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.ClinicResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IClinicService;
import com.nguyenhuyhoan.hospital.models.Clinic;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.Specialty;
import com.nguyenhuyhoan.hospital.repositoris.ClinicRepository;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClinicService implements IClinicService {

    private final ClinicRepository clinicRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;
    private final CloudinaryService cloudinaryService;


    @Override
    @Transactional
    public ClinicResponse createClinic(ClinicDTO clinicDTO) throws IOException {

        String photoUrl = cloudinaryService.uploadClinicImage(clinicDTO.getPhotoUrl());



        Specialty specialty = specialtyRepository.findById(clinicDTO.getSpecialtyId())
                .orElseThrow(()-> new DataNotFoundException("Không tồn tại chuyên khoa này"));

//        Doctor doctor = null;
//        if (clinicDTO.getDoctorId() != null) {
//            doctor = doctorRepository.findById(clinicDTO.getDoctorId())
//                    .orElseThrow(() -> new DataNotFoundException("Không tìm thấy bác sĩ"));
//        }
        Clinic clinic = Clinic.builder()
                .name(clinicDTO.getName())
                .phone(clinicDTO.getPhone())
                .address(clinicDTO.getAddress())
                .specialty(specialty)
                .photoUrl(photoUrl)
                .isActive(clinicDTO.getIsActive())
                .build();
        return ClinicResponse.fromClinic(clinicRepository.save(clinic));
    }

    @Override
    public Page<ClinicResponse> getAllClinics(Pageable pageable) {
        return clinicRepository.findAll(pageable).map(ClinicResponse::fromClinic);
    }

    @Override
    public ClinicResponse getClinicById(Long id) throws DataNotFoundException {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));
        return ClinicResponse.fromClinic(clinic);
    }

    @Override
    @Transactional // Nên thêm @Transactional để đảm bảo tính toàn vẹn dữ liệu khi có liên kết bảng
    public ClinicResponse updateClinic(Long id, ClinicDTO clinicDTO) throws IOException, DataNotFoundException {
        // 1. Tìm phòng khám cũ trong CSDL
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Phòng khám không tồn tại"));

        // 💡 Đust ĐÃ SỬA: Lấy dữ liệu mới từ clinicDTO để gán vào entity clinic (Tránh gán ngược)
        if (clinicDTO.getName() != null) {
            clinic.setName(clinicDTO.getName());
        }
        if (clinicDTO.getPhone() != null) {
            clinic.setPhone(clinicDTO.getPhone());
        }
        if (clinicDTO.getAddress() != null) {
            clinic.setAddress(clinicDTO.getAddress());
        }

        // 2. Xử lý cập nhật liên kết Chuyên khoa
        if (clinicDTO.getSpecialtyId() != null) {
            Specialty specialty = specialtyRepository.findById(clinicDTO.getSpecialtyId())
                    .orElseThrow(() -> new DataNotFoundException("Chuyên khoa không tồn tại"));
            clinic.setSpecialty(specialty);
        }

        if (clinicDTO.getDescription() != null) {
            clinic.setDescription(clinicDTO.getDescription());
        }

        // 3. Cập nhật trạng thái hoạt động (Phục vụ nút Khóa/Mở khóa trực tiếp từ hàm PUT)
        if (clinicDTO.getIsActive() != null) {
            clinic.setIsActive(clinicDTO.getIsActive());
        }

        // 4. Xử lý upload ảnh mới lên Cloudinary (nếu có truyền file)
        if (clinicDTO.getPhotoUrl() != null && !clinicDTO.getPhotoUrl().isEmpty()) {
            String newPhotoUrl = cloudinaryService.uploadClinicImage(clinicDTO.getPhotoUrl());
            clinic.setPhotoUrl(newPhotoUrl);
        }

        // 5. Lưu lại vào DB và trả về Response dạng chuẩn của bạn
        Clinic updatedClinic = clinicRepository.save(clinic);
        return ClinicResponse.fromClinic(updatedClinic);
    }
    @Override
    @Transactional
    public void deleteClinic(Long id) throws DataNotFoundException {
        Clinic clinic = clinicRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Phòng khám không tồn tại"));
        clinic.setIsActive(false);
        clinicRepository.save(clinic);


    }

    @Override
    public List<ClinicStatDTO> getClinicStat() {
        return clinicRepository.getClinicStatistics();
    }


}
