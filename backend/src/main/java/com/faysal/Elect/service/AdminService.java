package com.faysal.Elect.service;

import com.faysal.Elect.dto.ConstituencyRequest;
import com.faysal.Elect.dto.CreateElectionRequest;
import com.faysal.Elect.dto.ElectionResultResponse;
import com.faysal.Elect.entity.*;
import com.faysal.Elect.exception.DuplicateResourceException;
import com.faysal.Elect.exception.ResourceNotFoundException;
import com.faysal.Elect.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Everything only an election admin can do. This first slice covers setting
 * up the electoral map (constituencies) and elections; party/candidate
 * approval and the voter-roll CSV import get added to this class next.
 * Nothing here writes a vote — that's VoteService's job exclusively (Day 4).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ConstituencyRepository constituencyRepository;
    private final ElectionRepository electionRepository;
    private final PartyRepository partyRepository;
    private final CandidateRepository candidateRepository;
    private final VoterRepository voterRepository;
    private final VoteRepository voteRepository;

    // ---- Constituencies ----
    @Transactional
    public Constituency createConstituency(ConstituencyRequest request) {
        Constituency parent = null;
        if (request.parentId() != null) {
            parent = constituencyRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent constituency not found"));
        }
        Constituency c = Constituency.builder()
                .name(request.name())
                .level(Constituency.ConstituencyLevel.valueOf(request.level().toUpperCase()))
                .parent(parent)
                .build();
        return constituencyRepository.save(c);
    }

    // ---- Elections ----
    @Transactional
    public Election createElection(CreateElectionRequest request) {
        Constituency constituency = constituencyRepository.findById(request.constituencyId())
                .orElseThrow(() -> new ResourceNotFoundException("Constituency not found"));

        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        Election election = Election.builder()
                .name(request.name())
                .type(Election.ElectionType.valueOf(request.type().toUpperCase()))
                .constituency(constituency)
                .startTime(request.startTime())
                .endTime(request.endTime())
                .status(Election.ElectionStatus.SCHEDULED)
                .build();
        return electionRepository.save(election);
    }

    @Transactional
    public Election setElectionStatus(UUID electionId, String status) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election not found"));
        election.setStatus(Election.ElectionStatus.valueOf(status.toUpperCase()));
        return electionRepository.save(election);
    }

    // ---- Party / candidate approval ----
    @Transactional
    public Party setPartyStatus(UUID partyId, Party.PartyStatus status) {
        Party party = partyRepository.findById(partyId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found"));

        party.setStatus(status);
        return partyRepository.save(party);
    }

    @Transactional
    public Candidate setCandidateStatus(UUID candidateId, Candidate.CandidateStatus status) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));
        candidate.setStatus(status);
        return candidateRepository.save(candidate);
    }

    // Expected CSV header: voterRegNumber,fullName,dateOfBirth,constituencyId
    //
    // Deliberately fails the whole batch on the first duplicate/bad row rather
    // than silently skipping it — a bad row usually means the wrong file was
    // uploaded, and partial imports of a voter roll are the kind of mistake you
    // want surfaced immediately, not discovered on election day.
    @Transactional
    public int importVoterRoll(MultipartFile file) throws IOException {
        List<Voter> toSave = new ArrayList<>();
        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            var records = CSVFormat.DEFAULT.builder()
                    .setHeader().setSkipHeaderRecord(true).build().parse(reader);
            for (CSVRecord record : records) {
                String regNumber = record.get("voterRegNumber");
                if (voterRepository.findByVoterRegNumber(regNumber).isPresent()) {
                    throw new DuplicateResourceException("Voter roll already contains " + regNumber);
                }
                Constituency constituency = constituencyRepository.findById(UUID.fromString(record.get("constituencyId")))
                        .orElseThrow(() -> new ResourceNotFoundException("Constituency not found for row: " + regNumber));

                toSave.add(Voter.builder()
                        .voterRegNumber(regNumber)
                        .fullName(record.get("fullName"))
                        .dateOfBirth(LocalDate.parse(record.get("dateOfBirth")))
                        .constituency(constituency)
                        .registrationComplete(false)
                        .build());
            }
        }
        voterRepository.saveAll(toSave);
        return toSave.size();
    }

    // ---- Results / turnout ----

    // Tallies votes per candidate for an election. Note: this counts every
    // approved candidate across the whole election regardless of
    // constituency, which is correct for a single-constituency race
    // (presidential) but would need per-constituency grouping to properly
    // support a multi-seat election (e.g. all National Assembly seats at once) — noted as a
    // known simplification for now, see README "Next steps".
    public ElectionResultResponse getResults(UUID electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResourceNotFoundException("Election not found"));

        List<ElectionResultResponse.CandidateTally> tallies = candidateRepository.findByStatus(Candidate.CandidateStatus.APPROVED)
                .stream()
                .filter(c -> c.getElection().getId().equals(electionId))
                .map(c -> new ElectionResultResponse.CandidateTally(
                        c.getId(), c.getFullName(), c.getParty().getAcronym(),
                        voteRepository.countByElectionIdAndCandidateId(electionId, c.getId())))
                .toList();

        long total = voteRepository.countByElectionId(electionId);
        return new ElectionResultResponse(electionId, election.getName(), total, tallies);
    }

    public long getTurnout(UUID electionId) {
        return voteRepository.countByElectionId(electionId);
    }

    public List<Party> getPartiesByStatus(Party.PartyStatus status) {
        return partyRepository.findByStatus(status);
    }

    public List<Candidate> getCandidatesByStatus(Candidate.CandidateStatus status) {
        return candidateRepository.findByStatus(status);
    }

    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    public List<Constituency> getAllConstituencies() {
        return constituencyRepository.findAll();
    }

}
