package com.nguyenhuyhoan.hospital.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir}")
    private String rootDir; // Trong yml là "uploads" hoặc "uploads/"

    public String storeFile(MultipartFile file, String subFolder) throws IOException {
        if (file == null || file.isEmpty()) {
            System.out.println("DEBUG FileService: File bị rỗng, không làm gì cả.");
            return "default.png";
        }

        // TRẠM KIỂM SOÁT 2: Đường dẫn
        Path projectPath = Paths.get("").toAbsolutePath();
        Path uploadPath = projectPath.resolve(rootDir).resolve(subFolder);

//        System.out.println("DEBUG Project Path: " + projectPath);
//        System.out.println("DEBUG Full Upload Path: " + uploadPath);
//
//        if (!Files.exists(uploadPath)) {
//            Files.createDirectories(uploadPath);
//            System.out.println("DEBUG: Đã tạo thư mục thành công!");
//        } else {
//            System.out.println("DEBUG: Thư mục đã tồn tại từ trước.");
//        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Files.copy(file.getInputStream(), uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);

       // System.out.println("DEBUG: File đã được lưu tại: " + uploadPath.resolve(fileName));
        return fileName;
    }

    public void deleteFile(String fileName, String subFolder) throws IOException{
        if(fileName == null || fileName.equals("default.png")) return;

        Path projectPath = Paths.get("").toAbsolutePath();
        Path filePath = projectPath.resolve(rootDir).resolve(subFolder).resolve(fileName);

        if(Files.exists(filePath)){
            Files.delete(filePath);
        }

    }
}