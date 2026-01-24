package com.jobportal.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public UnauthorizedException() {
        super("Invalid credentials", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
