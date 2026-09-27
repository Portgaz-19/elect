package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * A person contesting a specific office in a specific election, on behalf of
 * a party. Only becomes votable once an admin sets status to APPROVED —
 * parties register their own candidates but can't approve their own submissions.
 */
@Entity
@Table(name = "candidates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @ManyToOne
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    // Constituency the candidate is contesting in (must match the election's
    // own constituency for non-presidential races — enforced in VoteService later)
    @ManyToOne
    @JoinColumn(name = "constituency_id", nullable = false)
    private Constituency constituency;

    @Column(nullable = false)
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String manifesto;

    private String runningMateName; // for presidential/gubernatorial tickets

    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status = CandidateStatus.PENDING;

    /**
     * PENDING: just registered by the party, not yet visible to voters.
     * APPROVED: cleared by an admin — can appear in listings and receive votes.
     * REJECTED: declined by an admin — kept for audit purposes, not shown to voters.
     */
    public enum CandidateStatus {
        PENDING, APPROVED, REJECTED
    }
}
