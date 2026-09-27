package com.faysal.Elect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CandidateRegisterRequest(
        @NotNull UUID electionId,
        @NotNull UUID constituencyId,
        @NotBlank String fullName,
        String bio,
        String manifesto,
        String runningMateName,
        String photoUrl
) {}
