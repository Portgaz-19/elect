package com.faysal.Elect.controller;

import com.faysal.Elect.entity.Candidate;
import com.faysal.Elect.entity.Party;
import com.faysal.Elect.entity.User;
import com.faysal.Elect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin "approve or reject" workflows for parties and candidates. Both start
 * PENDING when self-registered/submitted and need an admin to flip them to
 * APPROVED before they're visible to voters — see the entities doc for why.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApprovalController {

    private final AdminService adminService;

    @PatchMapping("/parties/{id}/approve")
    public ResponseEntity<Party> approveParty(@AuthenticationPrincipal User admin, @PathVariable UUID id) {
        return ResponseEntity.ok(adminService.setPartyStatus(admin.getEmail(), id, Party.PartyStatus.APPROVED));
    }

    @PatchMapping("/parties/{id}/reject")
    public ResponseEntity<Party> rejectParty(@AuthenticationPrincipal User admin, @PathVariable UUID id) {
        return ResponseEntity.ok(adminService.setPartyStatus(admin.getEmail(), id, Party.PartyStatus.REJECTED));
    }

    @PatchMapping("/candidates/{id}/approve")
    public ResponseEntity<Candidate> approveCandidate(@AuthenticationPrincipal User admin, @PathVariable UUID id) {
        return ResponseEntity.ok(adminService.setCandidateStatus(admin.getEmail(),id, Candidate.CandidateStatus.APPROVED));
    }

    @PatchMapping("/candidates/{id}/reject")
    public ResponseEntity<Candidate> rejectCandidate(@AuthenticationPrincipal User admin, @PathVariable UUID id) {
        return ResponseEntity.ok(adminService.setCandidateStatus(admin.getEmail(),id, Candidate.CandidateStatus.REJECTED));
    }

    @PostMapping(value = "/voter-roll/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Integer>> uploadVoterRoll(@RequestParam("file") MultipartFile file) throws IOException {
        int imported = adminService.importVoterRoll(file);
        return ResponseEntity.ok(Map.of("imported", imported));
    }

    @GetMapping("/parties")
    public ResponseEntity<List<Party>> pendingParties() {
        return ResponseEntity.ok(adminService.getPartiesByStatus(Party.PartyStatus.PENDING));
    }

    @GetMapping("/candidates")
    public ResponseEntity<List<Candidate>> pendingCandidates() {
        return ResponseEntity.ok(adminService.getCandidatesByStatus(Candidate.CandidateStatus.PENDING));
    }
}
