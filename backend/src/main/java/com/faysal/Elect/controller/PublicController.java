package com.faysal.Elect.controller;

import com.faysal.Elect.entity.Candidate;
import com.faysal.Elect.entity.Constituency;
import com.faysal.Elect.entity.Election;
import com.faysal.Elect.entity.Party;
import com.faysal.Elect.service.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * No-login-required browsing: active elections, candidates on the ballot,
 * and the list of approved parties. Deliberately thin — just delegates to
 * PublicService.
 */
@RestController
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/api/elections/active")
    public ResponseEntity<List<Election>> activeElections() {
        return ResponseEntity.ok(publicService.getActiveElections());
    }

    @GetMapping("/api/elections/{id}")
    public ResponseEntity<Election> election(@PathVariable UUID id) {
        return ResponseEntity.ok(publicService.getElection(id));
    }

    @GetMapping("/api/elections/{id}/candidates")
    public ResponseEntity<List<Candidate>> candidatesForElections(@PathVariable UUID id, @RequestParam(required = false) UUID constituencyId) {
        return ResponseEntity.ok(publicService.getCandidatesForElection(id, constituencyId));
    }

    @GetMapping("/api/candidates/{id}")
    public ResponseEntity<Candidate> candidate(@PathVariable UUID id) {
        return ResponseEntity.ok(publicService.getCandidate(id));
    }

    @GetMapping("/api/parties")
    public ResponseEntity<List<Party>> parties() {
        return ResponseEntity.ok(publicService.getApprovedParties());
    }

    @GetMapping("/api/elections")
    public ResponseEntity<List<Election>> allElections() {
        return ResponseEntity.ok(publicService.getAllElections());
    }

    @GetMapping("/api/constituencies")
    public ResponseEntity<List<Constituency>> allConstituencies() {
        return ResponseEntity.ok(publicService.getAllConstituencies());
    }
}
