package com.faysal.Elect.controller;

import com.faysal.Elect.dto.ConstituencyRequest;
import com.faysal.Elect.dto.CreateElectionRequest;
import com.faysal.Elect.entity.Constituency;
import com.faysal.Elect.entity.Election;
import com.faysal.Elect.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin endpoints for setting up the electoral map and controlling election
 * status. Locked to ROLE_ADMIN by SecurityConfig's /api/admin/** rule —
 * this controller trusts that anyone who reached it already has that role.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminElectionController {

    private final AdminService adminService;

    @PostMapping("/constituencies")
    public ResponseEntity<Constituency> createConstituency(@Valid @RequestBody ConstituencyRequest request) {
        return ResponseEntity.ok(adminService.createConstituency(request));
    }

    @PostMapping("/elections")
    public ResponseEntity<Election> createElection(@Valid @RequestBody CreateElectionRequest request) {
        return ResponseEntity.ok(adminService.createElection(request));
    }

    @PatchMapping("/elections/{id}/status")
    public ResponseEntity<Election> setStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.setElectionStatus(id, body.get("status")));
    }

    @GetMapping("/elections/{id}/turnout")
    public ResponseEntity<Map<String, Long>> turnout(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("votesCast", adminService.getTurnout(id)));
    }

    @GetMapping("/elections/{id}/results")
    public ResponseEntity<?> results(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getResults(id));
    }

    @GetMapping("/elections")
    public ResponseEntity<List<Election>> allElections() {
        return ResponseEntity.ok(adminService.getAllElections());
    }

    @GetMapping("/constituencies")
    public ResponseEntity<List<Constituency>> allConstituencies() {
        return ResponseEntity.ok(adminService.getAllConstituencies());
    }
}
