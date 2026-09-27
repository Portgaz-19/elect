package com.faysal.Elect.service;

import com.faysal.Elect.entity.Candidate;
import com.faysal.Elect.entity.Election;
import com.faysal.Elect.entity.Vote;
import com.faysal.Elect.entity.Voter;
import com.faysal.Elect.exception.AlreadyVotedException;
import com.faysal.Elect.exception.ElectionNotOpenException;
import com.faysal.Elect.exception.ResourceNotFoundException;
import com.faysal.Elect.repository.CandidateRepository;
import com.faysal.Elect.repository.ElectionRepository;
import com.faysal.Elect.repository.VoteRepository;
import com.faysal.Elect.repository.VoterRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * The heart of the whole system: casting a vote. Every check here matters —
 * this is the one place where a bug means either a stolen election result
 * or a legitimate voter wrongly turned away, so each guard below is
 * deliberate and ordered (cheapest/most-obviously-wrong checks first).
 */
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoterRepository voterRepository;
    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final VoteRepository voteRepository;

    @Transactional
    public Vote castVote(UUID userId, UUID electionId, UUID candidateId) {
        Voter voter = voterRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Voter profile not found"));

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election not found"));

        // Belt-and-braces: status must be OPEN *and* we must be inside the
        // time window. An admin could forget to flip status to CLOSED after
        // endTime passes, so we never trust status alone.
        Instant now = Instant.now();
        if (election.getStatus() != Election.ElectionStatus.OPEN || now.isBefore(election.getStartTime()) || now.isAfter(election.getEndTime())) {
            throw new ElectionNotOpenException("This election is not currently open for voting");
        }

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

        // Guards against voting for a candidate who's PENDING/REJECTED, or
        // one who's real but registered for a *different* election (a client
        // could otherwise pass a valid candidateId from another race).
        if (candidate.getStatus() != Candidate.CandidateStatus.APPROVED || !candidate.getElection().getId().equals(electionId)) {
            throw new IllegalArgumentException("Candidate is not valid for this election");
        }

        // Constituency scoping: a voter in Lagos can't vote for a candidate
        // running in Kano — except presidential races, which are national
        // and every voter is eligible regardless of constituency.
        if (!candidate.getConstituency().getId().equals(voter.getConstituency().getId()) && election.getType() != Election.ElectionType.PRESIDENTIAL) {
            throw new IllegalArgumentException("Candidate is not contesting in your constituency");
        }

        if (voteRepository.existsByVoterIdAndElectionId(voter.getId(), electionId)) {
            throw new AlreadyVotedException("You have already voted in this election");
        }

        Vote vote = Vote.builder()
                .voter(voter)
                .election(election)
                .candidate(candidate)
                .build();

        try {
            // saveAndFlush (not save) so a constraint violation surfaces
            // here, inside this try/catch, rather than later at transaction commit.
            return voteRepository.saveAndFlush(vote);
        } catch (DataIntegrityViolationException e) {
            // The real safety net: if two requests from the same voter raced
            // past the existsBy check above at nearly the same instant, the
            // DB's unique constraint on (voter_id, election_id) rejects the
            // second insert here — no double vote can ever land, regardless
            // of timing.
            throw new AlreadyVotedException("You have already voted in this election");
        }
    }

    public boolean hasVoted(UUID userId, UUID electionId) {
        Voter voter = voterRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Voter profile not found"));
        return voteRepository.existsByVoterIdAndElectionId(voter.getId(), electionId);
    }
}
