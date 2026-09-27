package com.faysal.Elect.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record ConstituencyRequest(
        @NotBlank String name,
        @NotBlank String level, // matches Constituency.ConstituencyLevel: NATIONAL, STATE, FEDERAL_CONSTITUENCY, WARD
        UUID parentId // optional — null for a top-level constituency like a state
) {}
