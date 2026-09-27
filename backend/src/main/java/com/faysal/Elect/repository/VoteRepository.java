package com.faysal.Elect.repository;

import com.faysal.Elect.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VoteRepository extends JpaRepository<Vote, UUID> {

    // Fast-path check VoteService will use before attempting an insert — this is
    // just for a friendly error message; the real guarantee against
    // double-voting is the DB unique constraint on (voter_id, election_id) from Vote.java.
    boolean existsByVoterIdAndElectionId(UUID voterId, UUID electionId);

    Optional<Vote> findByVoterIdAndElectionId(UUID voterId, UUID electionId);

    // Per-candidate tally, used to build the results breakdown
    long countByElectionIdAndCandidateId(UUID electionId, UUID candidateId);

    // Total ballots cast in an election, used for turnout reporting
    long countByElectionId(UUID electionId);
}
