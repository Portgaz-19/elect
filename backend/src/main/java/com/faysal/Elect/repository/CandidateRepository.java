package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {

    List<Candidate> findByStatus(Candidate.CandidateStatus status);

    // Used by PartyService so a party can list only its own candidates
    List<Candidate> findByPartyId(UUID partyId);

    // The core "what can this voter see" query: candidates for one election,
    // scoped to one constituency, that an admin has actually approved.
    // Three conditions chained with "And" — reads almost like the SQL WHERE clause it becomes.
    List<Candidate> findByElectionIdAndConstituencyIdAndStatus(
            UUID electionId, UUID constituencyId, Candidate.CandidateStatus status
    );
}
