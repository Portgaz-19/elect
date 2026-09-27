package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single election event (e.g. "2027 Presidential Election"). Only votable
 * while status is OPEN *and* the current time falls between startTime and
 * endTime — both conditions get checked together later in VoteService, since
 * an admin could forget to flip status after the window closes.
 */
@Entity
@Table(name = "elections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Election {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name; // e.g. "2027 Presidential Election"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ElectionType type;

    // The constituency level this election is scoped to (e.g. STATE for governorship)
    @ManyToOne
    @JoinColumn(name = "constituency_id", nullable = false)
    private Constituency constituency;

    @Column(nullable = false)
    private Instant startTime;

    @Column(nullable = false)
    private Instant endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ElectionStatus status = ElectionStatus.SCHEDULED;

    public enum ElectionType {
        PRESIDENTIAL, GUBERNATORIAL, NATIONAL_ASSEMBLY, STATE_ASSEMBLY
    }

    /**
     * SCHEDULED: created but voting hasn't started.
     * OPEN: admin has opened it for voting (still also gated by start/end time).
     * CLOSED: voting window ended, results not yet public.
     * RESULTS_PUBLISHED: final tally released.
     */
    public enum ElectionStatus {
        SCHEDULED, OPEN, CLOSED, RESULTS_PUBLISHED
    }
}
