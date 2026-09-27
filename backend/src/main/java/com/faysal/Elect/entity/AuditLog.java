package com.faysal.Elect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A record of a significant admin action — who did what, to which entity,
 * and when. This is intentionally minimal (no UI beyond a raw list
 * endpoint) but gives a real, queryable trail for the actions that matter
 * most for trust: approvals, rejections, and election status changes.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String actorEmail;

    @Column(nullable = false)
    private String action; // e.g. "PARTY_APPROVED", "ELECTION_STATUS_CHANGED"

    private String targetId; // the UUID of whatever was acted on, as a string

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();
}