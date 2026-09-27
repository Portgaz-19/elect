package com.faysal.Elect.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Deliberately maps to 401 rather than 404 — we don't want the status code
// to reveal whether voterRegNumber exists but DOB was wrong vs. it not
// existing at all, since that distinction helps an attacker probing for
// valid voter numbers.
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidVoterRollException extends RuntimeException {
    public InvalidVoterRollException(String message) {
        super(message);
    }
}
