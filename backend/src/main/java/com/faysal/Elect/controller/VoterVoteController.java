package com.faysal.Elect.controller;

import com.faysal.Elect.dto.CastVoteRequest;
import com.faysal.Elect.entity.User;
import com.faysal.Elect.entity.Vote;
import com.faysal.Elect.service.VoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * The two things a logged-in voter can do: check whether they've already
 * voted in a given election, and cast a vote. @AuthenticationPrincipal gives
 * us the User straight from the JWT-authenticated SecurityContext.
 */
@RestController
@RequestMapping("/api/voter/elections/{electionId}")
@RequiredArgsConstructor
public class VoterVoteController {

    private final VoteService voteService;

    @GetMapping("/eligibility")
    public ResponseEntity<Map<String, Boolean>> elegibility(@AuthenticationPrincipal User user, @PathVariable UUID electionId) {
        boolean hasVoted = voteService.hasVoted(user.getId(), electionId);
        return ResponseEntity.ok(Map.of("hasVoted", hasVoted));
    }

    @PostMapping("/vote")
    public ResponseEntity<Vote> vote(@AuthenticationPrincipal User user, @PathVariable UUID electionId, @Valid @RequestBody CastVoteRequest request) {
        Vote vote = voteService.castVote(user.getId(), electionId, request.candidateId());
        return ResponseEntity.ok(vote);
    }
}
