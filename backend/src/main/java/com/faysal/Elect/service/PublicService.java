package com.faysal.Elect.service;

import com.faysal.Elect.entity.Candidate;
import com.faysal.Elect.entity.Constituency;
import com.faysal.Elect.entity.Election;
import com.faysal.Elect.entity.Party;
import com.faysal.Elect.exception.ResourceNotFoundException;
import com.faysal.Elect.repository.CandidateRepository;
import com.faysal.Elect.repository.ConstituencyRepository;
import com.faysal.Elect.repository.ElectionRepository;
import com.faysal.Elect.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Read-only browsing endpoints that need no login: what elections exist,
 * who's running, which parties are registered. This is deliberately kept
 * separate from AdminService/PartyService so it's obvious at a glance which
 * methods are safe to expose without auth.
 */
@Service
@RequiredArgsConstructor
public class PublicService {

    private final ElectionRepository electionRepository;
    private final CandidateRepository candidateRepository;
    private final PartyRepository partyRepository;
    private final ConstituencyRepository constituencyRepository;

    public List<Election> getActiveElections() {
        Instant now = Instant.now();
        return electionRepository.findByStartTimeBeforeAndEndTimeAfter(now, now);
    }

    public Election getElection(UUID id) {
        return electionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Election not found"));
    }

    public List<Candidate> getCandidatesForElection(UUID electionId, UUID constituencyId) {
        Election election = getElection(electionId);
        UUID effectiveConstituencyId = constituencyId != null ? constituencyId : election.getConstituency().getId();
        return candidateRepository.findByElectionIdAndConstituencyIdAndStatus(electionId, effectiveConstituencyId, Candidate.CandidateStatus.APPROVED);
    }

    public Candidate getCandidate(UUID id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
    }

    public List<Party> getApprovedParties() {
        return partyRepository.findByStatus(Party.PartyStatus.APPROVED);
    }

    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    public List<Constituency> getAllConstituencies() {
        return constituencyRepository.findAll();
    }
}
