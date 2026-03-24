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
    public UserResponse updateUser(Long id, UpdateUserDTO updateUserDTO) throws DataNotFoundException {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Khong tim thay"));
        if(updateUserDTO.getFullName() != null) existingUser.setFullName(updateUserDTO.getFullName());
        if(updateUserDTO.getEmail() != null) existingUser.setEmail(updateUserDTO.getEmail());
        if(updateUserDTO.getAddress() != null) existingUser.setAddress(updateUserDTO.getAddress());

        return UserResponse.fromUser(userRepository.save(existingUser));
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
