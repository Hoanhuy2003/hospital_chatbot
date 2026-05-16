package com.nguyenhuyhoan.hospital.services;

import com.nguyenhuyhoan.hospital.dtos.requests.UpdateUserDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import com.nguyenhuyhoan.hospital.iservices.IUserService;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {

        return userRepository.findAll(pageable).map(UserResponse::fromUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserDTO dto) throws DataNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy người dùng"));

        // ── Thông tin cơ bản ──
        if (dto.getFullName()    != null) user.setFullName(dto.getFullName());
        if (dto.getPhone()       != null) user.setPhone(dto.getPhone());
        if (dto.getEmail()       != null) user.setEmail(dto.getEmail());
        if (dto.getDateOfBirth() != null) user.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getAddress()     != null) user.setAddress(dto.getAddress());
        if (dto.getAvatarUrl()   != null) user.setAvatarUrl(dto.getAvatarUrl());

        // ── Bảo hiểm y tế ──
        if (dto.getHealthInsuranceNumber() != null)
            user.setHealthInsuranceNumber(dto.getHealthInsuranceNumber());
        if (dto.getInsuranceExpiryDate() != null)
            user.setInsuranceExpiryDate(dto.getInsuranceExpiryDate());
        if (dto.getInsuranceBenefitLevel() != null)
            user.setInsuranceBenefitLevel(dto.getInsuranceBenefitLevel());

        if (dto.getGender() != null && !dto.getGender().isBlank()) {
            try {
                user.setGender(User.Gender.valueOf(dto.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                /* giữ nguyên */
            }
        }

        return UserResponse.fromUser(userRepository.save(user));
    }

    @Override
    public UserResponse getUserById(Long id) throws DataNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Khong tim thay"));
        return UserResponse.fromUser(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) throws DataNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(()-> new DataNotFoundException("Khong tim thay"));
        user.setIsActive(false);
        userRepository.save(user);


    }
}
