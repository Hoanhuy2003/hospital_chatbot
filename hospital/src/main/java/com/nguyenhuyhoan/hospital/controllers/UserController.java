package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.dtos.requests.UpdateUserDTO;
import com.nguyenhuyhoan.hospital.dtos.responses.UserResponse;
import com.nguyenhuyhoan.hospital.iservices.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("")
    public ResponseEntity<Page<UserResponse>> getAllUser(@RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserDTO updateUserDTO){
        try {
            UserResponse userResponse = userService.updateUser(id, updateUserDTO);
            return  ResponseEntity.ok(userResponse);
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponse userResponse = userService.getUserById(id);
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')") // Nên chặn chỉ cho Admin xóa
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Đã khóa tài khoản người dùng có ID: " + id);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa user: " + e.getMessage());
        }
    }
}
