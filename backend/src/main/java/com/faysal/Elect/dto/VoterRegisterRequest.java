package com.faysal.Elect.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

// Matches a voter against the pre-loaded roll (voterRegNumber + dateOfBirth
// must both match an existing Voter row), then sets up their login.
public record VoterRegisterRequest(
        @NotBlank String voterRegNumber,
        @NotNull @Past LocalDate dateOfBirth,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password
        ) {}
