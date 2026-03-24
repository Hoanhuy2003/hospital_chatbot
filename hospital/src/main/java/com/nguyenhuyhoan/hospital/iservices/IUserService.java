package com.nguyenhuyhoan.hospital.iservices;

import com.nguyenhuyhoan.hospital.dtos.requests.UpdateUserDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.exception.DataNotFoundException;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IUserService {

    Page<UserResponse> getAllUsers(Pageable pageable);

    UserResponse updateUser(Long id, UpdateUserDTO updateUserDTO) throws DataNotFoundException;

    UserResponse getUserById(Long id) throws DataNotFoundException;

    void deleteUser(Long id) throws DataNotFoundException;




}
