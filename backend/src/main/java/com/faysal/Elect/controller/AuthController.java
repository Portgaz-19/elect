package com.faysal.Elect.controller;

import com.faysal.Elect.dto.AuthRequest;
import com.faysal.Elect.dto.AuthResponse;
import com.faysal.Elect.dto.VoterRegisterRequest;
import com.faysal.Elect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Shared login for all three roles. Voter self-registration endpoint gets
 * added here once we build out the Voter roll-matching logic.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/voter/register")
    public ResponseEntity<AuthResponse> registerVoter(@Valid @RequestBody VoterRegisterRequest request) {
        return ResponseEntity.ok(authService.registerVoter(request));
    }
}
