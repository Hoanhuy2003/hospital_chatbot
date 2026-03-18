package com.nguyenhuyhoan.hospital.controllers;

import com.nguyenhuyhoan.hospital.components.JwtTokenUtils;
import com.nguyenhuyhoan.hospital.dtos.auth.AuthResponse;
import com.nguyenhuyhoan.hospital.dtos.auth.UserLoginDTO;
import com.nguyenhuyhoan.hospital.dtos.auth.UserRegisterDTO;
import com.nguyenhuyhoan.hospital.models.Role;
import com.nguyenhuyhoan.hospital.models.User;
import com.nguyenhuyhoan.hospital.repositoris.RoleRepository;
import com.nguyenhuyhoan.hospital.repositoris.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterDTO registerDTO){
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
                .isActive(true)
                .build();
        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/login")
    private ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginDTO loginDTO){
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getPhone(), loginDTO.getPassword())
            );

            User user = (User) authentication.getPrincipal();

            String token = jwtTokenUtils.generateToken(user);

            AuthResponse response = AuthResponse.builder()
                    .accessToken(token)
                    .role(user.getRole().getName())
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .message("Đăng nhập thành công")
                    .build();
            return ResponseEntity.ok(response);
        }catch (Exception e){
            return ResponseEntity.status(401).body(AuthResponse.builder()
                    .message("Sai số điện thoại hoặc mật khẩu")
                    .build()
            );


        }
    }
}
