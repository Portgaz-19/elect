package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * A geographic/electoral area — the thing an election is scoped to, and the
 * thing a voter and a candidate both belong to. Constituencies form a
 * hierarchy (a ward sits under an LGA/state, a state sits under national)
 * via the self-referencing `parent` link, so results can eventually be
 * rolled up if needed.
 */

@Entity
@Table(name = "constituencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Constituency {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name; // e.g. "Lagos", "Ikeja Federal Constituency", "Eti-Osa Ward 3"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConstituencyLevel level;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Constituency parent; // e.g. a ward's parent is its LGA/state

    public enum ConstituencyLevel {
        NATIONAL, STATE, FEDERAL_CONSTITUENCY, WARD
    }
}
