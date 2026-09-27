package com.faysal.Elect.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CastVoteRequest(@NotNull UUID candidateId) {}
