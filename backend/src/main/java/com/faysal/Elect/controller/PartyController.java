package com.faysal.Elect.controller;

import com.faysal.Elect.dto.AuthResponse;
import com.faysal.Elect.dto.CandidateRegisterRequest;
import com.faysal.Elect.dto.PartyRegisterRequest;
import com.faysal.Elect.entity.Candidate;
import com.faysal.Elect.entity.Party;
import com.faysal.Elect.entity.User;
import com.faysal.Elect.service.PartyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Party self-service: registering (creates the party's login), viewing its
 * own profile, and managing its own candidates. Everything except /register
 * requires a PARTY-role JWT (see SecurityConfig).
 */
@RestController
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @PostMapping("/api/party/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody PartyRegisterRequest request) {
        return ResponseEntity.ok(partyService.register(request));
    }

    @GetMapping("/api/party/me")
    public ResponseEntity<Party> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partyService.getUserById(user.getId()));
    }

    @PostMapping("/api/party/candidates")
    public ResponseEntity<Candidate> registerCandidate(@AuthenticationPrincipal User user, @Valid @RequestBody CandidateRegisterRequest request) {
        return ResponseEntity.ok(partyService.registerCandidate(user.getId(), request));
    }

    @GetMapping("/api/party/candidates")
    public ResponseEntity<List<Candidate>> myCandidates(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(partyService.getMyCandidates(user.getId()));
    }
}
