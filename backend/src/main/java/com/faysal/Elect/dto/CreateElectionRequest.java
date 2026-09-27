package com.faysal.Elect.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateElectionRequest(
        @NotBlank String name,
        @NotBlank String type, // matches Election.ElectionType
        @NotNull UUID constituencyId,
        @NotNull @Future Instant startTime,
        @NotNull @Future Instant endTime
        ) {
}
