package com.faysal.Elect.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ElectionNotOpenException extends RuntimeException {
    public ElectionNotOpenException(String message) {
        super(message);
    }
}
