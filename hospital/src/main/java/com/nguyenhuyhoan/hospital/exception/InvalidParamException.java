package com.nguyenhuyhoan.hospital.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class InvalidParamException extends RuntimeException {

    private HttpStatus status;
    private String errorCode;

    public InvalidParamException(String message) {


        super(message);
        this.status = HttpStatus.BAD_REQUEST;
        this.errorCode = "INVALID_PARAM";
    }
    public InvalidParamException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.errorCode = "INVALID_PARAM";
    }

    public InvalidParamException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
}
