package com.nguyenhuyhoan.hospital.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret
    ) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));

    }

    public String uploadDoctorImage(MultipartFile file) throws IOException{
        if(file == null || file.isEmpty()){
            throw  new RuntimeException("File ảnh k được để trống");
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "hospital/doctor",
                "resource_type", "image",
                "overwrite", true
        ));

        return (String) uploadResult.get("secure_url");
    }

    public String uploadMedicalImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống");
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "hospital/medical_records", // Folder khác để dễ quản lý
                "resource_type", "auto", // Để auto để hỗ trợ cả PDF nếu cần
                "overwrite", true
        ));

        return (String) uploadResult.get("secure_url");
    }

    public String uploadLicenseImage(MultipartFile file) throws IOException{
        if (file == null || file.isEmpty()){
            throw new RuntimeException("File chứng chỉ không được bỏ trống");
        }
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "hospital/license",
                "resource_type", "image",
                "overwrite", true
        ));

        return (String) uploadResult.get("secure_url");


    }

    public String uploadClinicImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh phòng khám không được để trống");
        }

        // Upload ảnh lên folder riêng của clinic
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "hospital/clinics",
                "resource_type", "image",
                "overwrite", true
        ));

        // Trả về secure_url để lưu vào database
        return (String) uploadResult.get("secure_url");
    }
}
