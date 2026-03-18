package com.nguyenhuyhoan.hospital.components;

import com.nguyenhuyhoan.hospital.exception.InvalidParamException;
import com.nguyenhuyhoan.hospital.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import java.security.InvalidParameterException;
import java.security.SecureRandom;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtTokenUtils {

    @Value("${jwt.expiration}")
    private int expiration;

    @Value("${jwt.secretKey}")
    private String secretKey;

    private SecretKey getSigningKey(){
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String generateSecretKey(){
        SecureRandom radom = new SecureRandom();
        byte[] keyBytes = new byte[32];
        radom.nextBytes(keyBytes);
        String secretKey = Encoders.BASE64.encode(keyBytes);
        return secretKey;
    }

    public String generateToken(User user) throws Exception{
        Map<String, Object> claims = new HashMap<>();
        claims.put("phone", user.getPhone());
        claims.put("userId", user.getId());

        try{
            return Jwts.builder()
                    .setClaims(claims)
                    .setSubject(user.getPhone())
                    .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000L))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();


        } catch (Exception e) {
            throw new InvalidParamException("khong tao duoc token" + e.getMessage());
        }
    }

    private Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsTFunction){
        final Claims claims = extractAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    public boolean isTokenExpired(String token){
        return extractClaim(token,Claims::getExpiration).before(new Date());
    }

    public String extractPhone(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public boolean validateToken(String token, UserDetails userDetails){
        final String phone = extractPhone(token);
        return (phone.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

//    public static void main(String[] args) {
//        // Tạo một instance tạm thời của JwtTokenUtil.
//        // Vì đây là phương thức static main, nó chạy độc lập và không cần Spring context.
//        // Chúng ta chỉ cần gọi generateSecretKey().
//        JwtTokenUtils tempUtil = new JwtTokenUtils();
//        String generatedKey = tempUtil.generateSecretKey(); // Gọi phương thức tạo khóa
//
//        System.out.println("------------------------------------------------------------------");
//        System.out.println("SAO CHÉP CHÍNH XÁC CHUỖI DƯỚI ĐÂY VÀ DÁN VÀO application.properties/yml:");
//        System.out.println(generatedKey); // In khóa ra console
//        System.out.println("------------------------------------------------------------------");
//    }
}
