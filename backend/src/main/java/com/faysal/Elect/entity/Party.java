package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A political party. A party gets its own login (via the linked User, role
 * PARTY) so it can self-register and manage its own candidates, but starts
 * life as PENDING — it can't register candidates until an admin approves it.
 */
@Entity
@Table(name = "parties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Party {

    @Id
    @GeneratedValue
    private UUID id;

    // The login identity of the party's registered representative
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String acronym;

    private String logoUrl;

    private String chairmanName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartyStatus status = PartyStatus.PENDING;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant appliedAt = Instant.now();

    public enum PartyStatus {
        PENDING, APPROVED, REJECTED
    }
}
