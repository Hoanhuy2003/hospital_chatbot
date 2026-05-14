package com.nguyenhuyhoan.hospital.configurations;

import com.nguyenhuyhoan.hospital.components.JwtFilter;
import com.nguyenhuyhoan.hospital.securitis.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // ── Auth ──
                        .requestMatchers("/api/auth/**").permitAll()

                        // ── Specialty ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/specialty/**").permitAll()

                        // ── Doctor ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/doctors/**").permitAll()
                        // ── Medicine ──
                        .requestMatchers(HttpMethod.GET,    "/api/v1/medicines/**").permitAll()
                        .requestMatchers(HttpMethod.POST,   "/api/v1/medicines/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/medicines/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/medicines/**").hasRole("ADMIN")

                        // ── Invoice ──
                        .requestMatchers(HttpMethod.GET,  "/api/v1/invoices/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/invoices/**").hasAnyRole("ADMIN", "DOCTOR")

                        // ── Schedule ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/schedules/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/schedules/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/schedule-templates/**").hasAnyRole("ADMIN", "DOCTOR")

                        // ── Appointment ──
                        .requestMatchers(HttpMethod.POST, "/api/v1/appointments").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/v1/appointments/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/appointments/*/status").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.GET,"/api/v1/appointments/**").permitAll()
                        //.requestMatchers(HttpMethod.PATCH, "/api/v1/appointments/*/status").hasAnyRole("DOCTOR","ADMIN")

                        // ── Chatbot ──
                        .requestMatchers(HttpMethod.GET,  "/api/v1/chatbots/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/chatbots/**").permitAll()

                        // ── Payment / VNPay ──
                        // Tạo URL: cần đăng nhập (để lấy thông tin hóa đơn)
                        .requestMatchers(HttpMethod.GET, "/api/v1/payment/create/**").authenticated()
                        // Callback từ VNPay: không có token → permitAll
                        .requestMatchers(HttpMethod.GET, "/api/v1/payment/vnpay-return").permitAll()

                        // ── User profile (xem & sửa hồ sơ cá nhân) ──
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/**").authenticated()

                        // ── Medical Records ──
                        // GET: bệnh nhân, bác sĩ, admin đều được xem
                        .requestMatchers(HttpMethod.GET,  "/api/v1/medical_records/**").permitAll()
                        // POST/PUT: chỉ bác sĩ và admin mới được tạo / sửa
                        .requestMatchers(HttpMethod.POST, "/api/v1/medical_records/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT,  "/api/v1/medical_records/**").hasAnyRole("ADMIN", "DOCTOR")

                        // ── Static files ──
                        .requestMatchers("/uploads/**").permitAll()

                        // ── WebSocket ──
                        .requestMatchers("/ws-hospital/**").permitAll()

                        // ── Admin only ──
                        .requestMatchers("/api/auth/register/admin").hasRole("ADMIN")

                        // ── Còn lại phải đăng nhập ──
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000","http://localhost:3001"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}