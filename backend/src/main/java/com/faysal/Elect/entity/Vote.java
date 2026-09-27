package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single cast ballot. The unique constraint below on (voter_id,
 * election_id) — declared here AND again in the Flyway migration we'll
 * write next — is the actual mechanism that makes double-voting impossible,
 * even under two concurrent requests from the same voter. VoteService will
 * do an application-level check first (for a friendly error message), but
 * this DB constraint is what actually guarantees correctness.
 *
 * Note: votes are linked to the voter (not anonymous) in this version —
 * non-duplicable, not fully anonymous. Full ballot anonymity would need a
 * token-based unlinking scheme, which is a stretch goal, not attempted here.
 */
@Entity
@Table(name = "votes", uniqueConstraints = {
        @UniqueConstraint(name = "uq_vote_voter_election", columnNames = {"voter_id", "election_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "voter_id", nullable = false)
    private Voter voter;

    @ManyToOne
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant castAt = Instant.now();
}
