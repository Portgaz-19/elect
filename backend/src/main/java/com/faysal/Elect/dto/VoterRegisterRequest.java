package com.faysal.Elect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;

// Matches a voter against the pre-loaded roll (voterRegNumber + dateOfBirth
// must both match an existing Voter row), then sets up their login.
public record VoterRegisterRequest(
        @NotBlank String voterRegNumber,
        @NotNull @Past LocalDate dateOfBirth,
        @NotBlank @Email String email,
        @NotBlank String password
        ) {}
