package com.faysal.Elect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Used for both login and the eventual voter self-registration login step —
// same shape either way: email + password.
public record AuthRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
