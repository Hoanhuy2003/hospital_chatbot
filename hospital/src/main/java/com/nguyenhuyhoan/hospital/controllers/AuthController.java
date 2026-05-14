package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.components.JwtTokenUtils;
import com.nguyenhuyhoan.hospital.dtos.auth.AuthResponse;
import com.nguyenhuyhoan.hospital.dtos.auth.UserLoginDTO;
import com.nguyenhuyhoan.hospital.dtos.auth.UserRegisterDTO;
import com.nguyenhuyhoan.hospital.models.Doctor;
import com.nguyenhuyhoan.hospital.models.Role;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.DoctorRepository;
import com.nguyenhuyhoan.hospital.repositoris.RoleRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterDTO registerDTO){

        if(!registerDTO.getPassword().equals(registerDTO.getRetypePassword())){
            return ResponseEntity.badRequest().body("Mật khẩu nhập lại không khớp");
        }

        if(userRepository.existsByPhone(registerDTO.getPhone())){
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại");
        }

        if(userRepository.existsByEmail(registerDTO.getEmail())){
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }

        Role patientRole = roleRepository.findByName("PATIENT")
                .orElseThrow(()-> new RuntimeException("Role PATIENT không tồn tại"));

        User user = User.builder()
                .fullName(registerDTO.getFullName())
                .phone(registerDTO.getPhone())
                .email(registerDTO.getEmail())
                .passwordHash(passwordEncoder.encode(registerDTO.getPassword()))
                .role(patientRole)
                .dateOfBirth(registerDTO.getDateOfBirth())
                .address(registerDTO.getAddress())
                .isActive(true)
                .build();

        if(registerDTO.getGender() != null){
            try {
                user.setGender(User.Gender.valueOf(registerDTO.getGender().toUpperCase()));
            } catch (IllegalArgumentException e){
                return ResponseEntity.badRequest().body("Giới tính không hợp lệ");
            }
        }
        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/login")
    private ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginDTO loginDTO){
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getPhone(), loginDTO.getPassword())
            );

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userDetails.getUser();

            String token = jwtTokenUtils.generateToken(user);

            AuthResponse.AuthResponseBuilder builder = AuthResponse.builder()
                    .accessToken(token)
                    .role(user.getRole().getName())
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .message("Đăng nhập thành công");

            // Nếu là DOCTOR thì tra thêm doctorId và clinicId
            if ("DOCTOR".equals(user.getRole().getName())) {
                doctorRepository.findByUserId(user.getId()).ifPresent(doctor -> {
                    builder.doctorId(doctor.getId());
                    if (doctor.getClinic() != null) {
                        builder.clinicId(doctor.getClinic().getId());
                    }
                });
            }

            return ResponseEntity.ok(builder.build());

        } catch (Exception e){
            e.printStackTrace(); // 🔥 thêm dòng này để debug
            return ResponseEntity.status(401).body(AuthResponse.builder()
                    .message("Sai số điện thoại hoặc mật khẩu")
                    .build()
            );
        }
    }

    @PostMapping("register/admin")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> registerAdmin(@Valid @RequestBody UserRegisterDTO registerDTO){
        if(!registerDTO.getPassword().equals(registerDTO.getRetypePassword())){
            return ResponseEntity.badRequest().body("Mật khẩu nhập lại không khớp");
        }

        if(userRepository.existsByPhone(registerDTO.getPhone())){
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại");
        }

        if(userRepository.existsByEmail(registerDTO.getEmail())){
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Role ADMIN không tồn tại trong hệ thống"));

        User admin = User.builder()
                .fullName(registerDTO.getFullName())
                .phone(registerDTO.getPhone())
                .email(registerDTO.getEmail())
                .passwordHash(passwordEncoder.encode(registerDTO.getPassword()))
                .role(adminRole)
                .dateOfBirth(registerDTO.getDateOfBirth())
                .address(registerDTO.getAddress())
                .isActive(true)
                .build();
        if(registerDTO.getGender() != null){
            try {
                admin.setGender(User.Gender.valueOf(registerDTO.getGender().toUpperCase()));
            } catch (IllegalArgumentException e){
                return ResponseEntity.badRequest().body("Giới tính không hợp lệ");
            }
        }

        userRepository.save(admin);
        return ResponseEntity.ok("Tạo tài khoản Admin thành công");
    }
}
